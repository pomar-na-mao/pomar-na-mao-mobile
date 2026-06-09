import { createSprayingRepository } from '@/data/repositories/spraying/spraying-repository';
import {
  reconcileSprayingLocationUpdates,
  startSprayingLocationUpdates,
  stopSprayingLocationUpdates,
  type SprayingTrackingReconciliation,
} from '@/data/services/spraying/spraying-location-service';
import type { SprayingAggregate, SprayingPlant, SprayingSetup, SprayingZoneOption } from '@/domain/models/spraying';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { getSprayingDeviceId } from '@/ui/spraying/helpers/device';
import { consolidateSprayingRoute, simulateSprayingPlants } from '@/ui/spraying/helpers/spraying-route';
import * as Location from 'expo-location';
import { useSQLiteContext } from 'expo-sqlite';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

interface SprayingContextValue {
  aggregate: SprayingAggregate | null;
  currentLocation: Location.LocationObject | null;
  zones: SprayingZoneOption[];
  selectedZone: SprayingZoneOption | null;
  selectedZonePlants: SprayingPlant[];
  trackingState: SprayingTrackingReconciliation;
  isZoneSelectionVisible: boolean;
  isSetupVisible: boolean;
  isReviewVisible: boolean;
  openZoneSelection(): void;
  closeZoneSelection(): void;
  loadZone(zoneId: string): Promise<void>;
  openSetup(): void;
  closeSetup(): void;
  openReview(): void;
  closeReview(): void;
  beginOperation(setup: SprayingSetup): Promise<void>;
  deleteActiveOperation(): Promise<void>;
  prepareRouteSimulation(): Promise<boolean>;
  recordSimulatedLocation(location: Location.LocationObject): Promise<void>;
  startTracking(): Promise<void>;
  finishTracking(): Promise<void>;
  simulate(): Promise<void>;
  togglePlant(plant: SprayingPlant): Promise<void>;
  confirmReview(): Promise<void>;
  syncOperation(): Promise<void>;
  refresh(): Promise<void>;
}

const SprayingContext = createContext({} as SprayingContextValue);

function clearSprayingReviewState(plants: SprayingPlant[]) {
  return plants.map((plant) => ({
    ...plant,
    distanceMeters: null,
    matchSource: null,
    reviewStatus: null,
  }));
}

export function SprayingProvider({ children }: { children: React.ReactNode }) {
  const database = useSQLiteContext();
  const repository = useMemo(() => createSprayingRepository(database), [database]);
  const { setMessage, setIsVisible } = useAlertBoxStore();
  const { setIsLoading } = useLoadingStore();
  const [aggregate, setAggregate] = useState<SprayingAggregate | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [zones, setZones] = useState<SprayingZoneOption[]>([]);
  const [selectedZone, setSelectedZone] = useState<SprayingZoneOption | null>(null);
  const [selectedZonePlants, setSelectedZonePlants] = useState<SprayingPlant[]>([]);
  const [trackingState, setTrackingState] = useState<SprayingTrackingReconciliation>('inactive');
  const [isZoneSelectionVisible, setIsZoneSelectionVisible] = useState(false);
  const [isSetupVisible, setIsSetupVisible] = useState(false);
  const [isReviewVisible, setIsReviewVisible] = useState(false);
  const activeOperationIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeOperationIdRef.current = aggregate?.operation.id ?? null;
  }, [aggregate]);

  const refreshOperation = useCallback(
    async (operationId?: string | null) => {
      const id = operationId ?? activeOperationIdRef.current;
      if (!id) {
        setAggregate(null);
        return;
      }

      const nextAggregate = await repository.local.getAggregate(id);
      setAggregate(nextAggregate);
      if (nextAggregate) {
        setSelectedZone({
          id: nextAggregate.operation.zone_id,
          name: nextAggregate.operation.zone_name,
        });
        setSelectedZonePlants(nextAggregate.plants);
      }
    },
    [repository],
  );

  const refresh = useCallback(async () => {
    const recoverable = await repository.local.getRecoverableOperation();
    if (!recoverable) {
      setAggregate(null);
      setTrackingState(await reconcileSprayingLocationUpdates(null));
      return;
    }

    await refreshOperation(recoverable.id);
    if (recoverable.lifecycle_status === 'tracking') {
      setTrackingState(await reconcileSprayingLocationUpdates(recoverable.id));
    } else {
      setTrackingState('inactive');
    }
  }, [refreshOperation, repository]);

  useEffect(() => {
    let mounted = true;
    let locationSubscription: Location.LocationSubscription | null = null;

    void Promise.all([repository.local.getZones(), refresh()]).then(async ([cachedZones]) => {
      if (!mounted) {
        return;
      }

      setZones(cachedZones);
      const { data, error } = await repository.getZones();

      if (!mounted) {
        return;
      }

      if (data) {
        setZones(data);
      } else if (error && cachedZones.length === 0) {
        setMessage(`Erro ao carregar zonas de Pulverização.\n${error.message}`);
        setIsVisible(true);
      }
    });

    void Location.requestForegroundPermissionsAsync().then(async ({ status }) => {
      if (!mounted || status !== 'granted') {
        return;
      }

      const firstLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      if (mounted) {
        setCurrentLocation(firstLocation);
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 1,
          timeInterval: 1_000,
        },
        (location) => {
          if (mounted) {
            setCurrentLocation(location);
          }
        },
      );
    });

    return () => {
      mounted = false;
      locationSubscription?.remove();
    };
  }, [refresh, repository, setIsVisible, setMessage]);

  useEffect(() => {
    if (aggregate?.operation.lifecycle_status !== 'tracking') {
      return;
    }

    const interval = setInterval(() => {
      void refreshOperation(aggregate.operation.id);
    }, 2_000);

    return () => clearInterval(interval);
  }, [aggregate?.operation.id, aggregate?.operation.lifecycle_status, refreshOperation]);

  const loadZone = useCallback(
    async (zoneId: string) => {
      const zone = zones.find((item) => item.id === zoneId);
      if (!zone) {
        setMessage('Selecione uma zona valida.');
        setIsVisible(true);
        return;
      }

      setIsLoading(true);
      try {
        const cachedPlants = await repository.local.getZonePlants(zone.id);
        setSelectedZone(zone);
        setSelectedZonePlants(cachedPlants);

        const { data, error } = await repository.getZonePlants(zone.id);
        if (data) {
          await repository.local.cacheZonePlants(zone.id, zone.name, data);
          setSelectedZonePlants(data);
        } else if (error && cachedPlants.length === 0) {
          throw new Error(`Erro ao carregar da zona.\n${error.message}`);
        }

        setIsZoneSelectionVisible(false);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : String(error));
        setIsVisible(true);
      } finally {
        setIsLoading(false);
      }
    },
    [repository, setIsLoading, setIsVisible, setMessage, zones],
  );

  const beginOperation = useCallback(
    async (setup: SprayingSetup) => {
      setIsLoading(true);
      let operationId: string | null = null;
      try {
        const operation = await repository.local.createOperation(setup, getSprayingDeviceId());
        operationId = operation.id;
        const started = await startSprayingLocationUpdates(operation.id, operation.device_id);
        if (!started) {
          await refreshOperation(operation.id);
          setIsSetupVisible(false);
          throw new Error('Operacao salva. Permita localização em primeiro plano e em segundo plano para iniciar.');
        }

        await repository.local.markTracking(operation.id);
        setTrackingState('active');
        await refreshOperation(operation.id);
        setIsSetupVisible(false);
      } catch (error) {
        if (operationId) {
          await refreshOperation(operationId);
          setIsSetupVisible(false);
        }
        setMessage(error instanceof Error ? error.message : String(error));
        setIsVisible(true);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshOperation, repository, setIsLoading, setIsVisible, setMessage],
  );

  const startTracking = useCallback(async () => {
    if (
      !aggregate ||
      !['draft', 'tracking'].includes(aggregate.operation.lifecycle_status) ||
      (aggregate.operation.lifecycle_status === 'tracking' && trackingState !== 'recovery_required')
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const started = await startSprayingLocationUpdates(aggregate.operation.id, aggregate.operation.device_id);
      if (!started) {
        throw new Error('Permita localização em primeiro plano e em segundo plano para iniciar.');
      }

      await repository.local.markTracking(aggregate.operation.id);
      setTrackingState('active');
      await refreshOperation(aggregate.operation.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }, [aggregate, refreshOperation, repository, setIsLoading, setIsVisible, setMessage, trackingState]);

  const deleteActiveOperation = useCallback(async () => {
    if (!aggregate) {
      return;
    }

    setIsLoading(true);
    try {
      if (aggregate.operation.lifecycle_status === 'tracking') {
        await stopSprayingLocationUpdates();
      }
      await repository.local.deleteOperation(aggregate.operation.id);
      activeOperationIdRef.current = null;
      setAggregate(null);
      setSelectedZonePlants((currentPlants) => clearSprayingReviewState(currentPlants));
      setTrackingState('inactive');
      setIsReviewVisible(false);
      setIsSetupVisible(false);
      setMessage('Pulverização local excluida.');
      setIsVisible(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }, [aggregate, repository, setIsLoading, setIsVisible, setMessage]);

  const prepareRouteSimulation = useCallback(async () => {
    if (!__DEV__) {
      return false;
    }
    if (!aggregate || aggregate.operation.lifecycle_status !== 'tracking') {
      return false;
    }

    try {
      await stopSprayingLocationUpdates();
      await repository.local.resetTrackPointsForSimulation(aggregate.operation.id);
      setTrackingState('inactive');
      setAggregate((current) => {
        if (!current || current.operation.id !== aggregate.operation.id) {
          return current;
        }

        return {
          ...current,
          route: null,
          trackPoints: [],
          summary: {
            ...current.summary,
            routeDistanceMeters: 0,
            trackPoints: 0,
          },
        };
      });
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
      setIsVisible(true);
      return false;
    }
  }, [aggregate, repository, setIsVisible, setMessage]);

  const recordSimulatedLocation = useCallback(
    async (location: Location.LocationObject) => {
      if (!__DEV__) {
        return;
      }

      setCurrentLocation(location);

      if (!aggregate || aggregate.operation.lifecycle_status !== 'tracking') {
        return;
      }

      const point = await repository.local.appendTrackPoint({
        operationId: aggregate.operation.id,
        recordedAt: new Date(location.timestamp).toISOString(),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speedMps: location.coords.speed ?? null,
        accuracyM: location.coords.accuracy ?? null,
        deviceId: aggregate.operation.device_id,
      });

      setAggregate((current) => {
        if (!current || current.operation.id !== aggregate.operation.id) {
          return current;
        }

        return {
          ...current,
          trackPoints: [...current.trackPoints, point],
          summary: {
            ...current.summary,
            trackPoints: current.summary.trackPoints + 1,
          },
        };
      });
    },
    [aggregate, repository],
  );

  const finishTracking = useCallback(async () => {
    if (!aggregate || aggregate.operation.lifecycle_status !== 'tracking') {
      return;
    }

    setIsLoading(true);
    try {
      await stopSprayingLocationUpdates();
      await repository.local.finishTracking(aggregate.operation.id);
      const operation = await repository.local.getOperation(aggregate.operation.id);
      const points = await repository.local.listTrackPoints(aggregate.operation.id);
      if (!operation) {
        throw new Error('Operacao local nao encontrada.');
      }

      const route = consolidateSprayingRoute(points);
      await repository.local.saveConsolidatedRoute(operation, route);
      setTrackingState('inactive');
      await refreshOperation(operation.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }, [aggregate, refreshOperation, repository, setIsLoading, setIsVisible, setMessage]);

  const simulate = useCallback(async () => {
    if (!aggregate || aggregate.operation.lifecycle_status !== 'finished') {
      return;
    }

    setIsLoading(true);
    try {
      const matches = simulateSprayingPlants({
        plants: aggregate.plants,
        points: aggregate.trackPoints,
        minDistanceMeters: aggregate.operation.min_distance_meters,
        maxDistanceMeters: aggregate.operation.max_distance_meters,
      });
      await repository.local.saveSimulation(aggregate.operation.id, matches);
      await repository.local.confirmAllAutomaticCandidates(aggregate.operation.id, aggregate.operation.device_id);
      await refreshOperation(aggregate.operation.id);
      setIsReviewVisible(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }, [aggregate, refreshOperation, repository, setIsLoading, setIsVisible, setMessage]);

  const togglePlant = useCallback(
    async (plant: SprayingPlant) => {
      if (!aggregate) {
        return;
      }

      const confirmed = !['confirmed', 'manually_added'].includes(plant.reviewStatus ?? '');
      await repository.local.setPlantConfirmed({
        operationId: aggregate.operation.id,
        plantId: plant.plantId,
        confirmed,
        deviceId: aggregate.operation.device_id,
        distanceMeters: plant.distanceMeters ?? null,
      });
      await refreshOperation(aggregate.operation.id);
    },
    [aggregate, refreshOperation, repository],
  );

  const confirmReview = useCallback(async () => {
    if (!aggregate || aggregate.operation.lifecycle_status !== 'simulated') {
      return;
    }

    await repository.local.markReviewed(aggregate.operation.id);
    await refreshOperation(aggregate.operation.id);
    setIsReviewVisible(false);
  }, [aggregate, refreshOperation, repository]);

  const syncOperation = useCallback(async () => {
    if (!aggregate || !['reviewed', 'sync_error'].includes(aggregate.operation.lifecycle_status)) {
      return;
    }

    setIsLoading(true);
    try {
      const payload = await repository.local.buildSyncPayload(aggregate.operation.id);
      await repository.local.markSyncing(aggregate.operation.id);
      await refreshOperation(aggregate.operation.id);

      const { data, error } = await repository.syncReviewedOperation(payload);
      if (error || !data) {
        throw new Error(error?.message ?? 'A RPC de Pulverização nao retornou dados.');
      }

      await repository.local.markSynced(aggregate.operation.id, data);
      activeOperationIdRef.current = null;
      setAggregate(null);
      setSelectedZonePlants((currentPlants) => clearSprayingReviewState(currentPlants));
      setTrackingState('inactive');
      setIsReviewVisible(false);
      setIsSetupVisible(false);
      setMessage('Pulverização sincronizada com sucesso.');
      setIsVisible(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await repository.local.markSyncError(aggregate.operation.id, message);
      await refreshOperation(aggregate.operation.id);
      setMessage(`Erro ao sincronizar Pulverização.\n${message}`);
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }, [aggregate, refreshOperation, repository, setIsLoading, setIsVisible, setMessage]);

  return (
    <SprayingContext.Provider
      value={{
        aggregate,
        currentLocation,
        zones,
        selectedZone,
        selectedZonePlants,
        trackingState,
        isZoneSelectionVisible,
        isSetupVisible,
        isReviewVisible,
        openZoneSelection: () => setIsZoneSelectionVisible(true),
        closeZoneSelection: () => setIsZoneSelectionVisible(false),
        loadZone,
        openSetup: () => {
          if (selectedZone) {
            setIsSetupVisible(true);
          }
        },
        closeSetup: () => setIsSetupVisible(false),
        openReview: () => setIsReviewVisible(true),
        closeReview: () => setIsReviewVisible(false),
        beginOperation,
        deleteActiveOperation,
        prepareRouteSimulation,
        recordSimulatedLocation,
        startTracking,
        finishTracking,
        simulate,
        togglePlant,
        confirmReview,
        syncOperation,
        refresh,
      }}
    >
      {children}
    </SprayingContext.Provider>
  );
}

export function useSpraying() {
  return useContext(SprayingContext);
}
