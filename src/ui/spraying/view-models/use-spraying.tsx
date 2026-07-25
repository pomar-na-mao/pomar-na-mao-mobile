import { createSprayingRepository } from '@/data/repositories/spraying/spraying-repository';
import {
  clearLoadedSprayingZone,
  getLoadedSprayingZone,
  saveLoadedSprayingZone,
} from '@/data/services/spraying/spraying-loaded-zone-service';
import {
  reconcileSprayingLocationUpdates,
  startSprayingLocationUpdates,
  stopSprayingLocationUpdates,
  type SprayingTrackingReconciliation,
} from '@/data/services/spraying/spraying-location-service';
import type {
  LocalSprayingOperation,
  SprayingAggregate,
  SprayingPlant,
  SprayingSetup,
  SprayingZoneOption,
} from '@/domain/models/spraying';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { getSprayingZonesSnapshot } from '@/ui/shared/hooks/use-field-work-data';
import { getSprayingDeviceId } from '@/ui/spraying/helpers/device';
import { consolidateSprayingRoute, simulateSprayingPlants } from '@/ui/spraying/helpers/spraying-route';
import { useQueryClient } from '@tanstack/react-query';
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
  operationsList: LocalSprayingOperation[];
  activeView: 'list' | 'map';
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
  openListView(): void;
  openMapView(operationId?: string): Promise<void>;
  beginOperation(setup: SprayingSetup): Promise<void>;
  deleteActiveOperation(): Promise<void>;
  deleteOperationById(operationId: string): Promise<void>;
  prepareRouteSimulation(): Promise<boolean>;
  recordSimulatedLocation(location: Location.LocationObject): Promise<void>;
  startTracking(): Promise<void>;
  finishTracking(): Promise<void>;
  simulate(): Promise<void>;
  togglePlant(plant: SprayingPlant): Promise<void>;
  confirmReview(): Promise<void>;
  syncOperation(): Promise<void>;
  syncOperationById(operationId: string): Promise<void>;
  refreshOperationsList(): Promise<void>;
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
  const queryClient = useQueryClient();
  const database = useSQLiteContext();
  const repository = useMemo(() => createSprayingRepository(database), [database]);
  const { setMessage, setIsVisible } = useAlertBoxStore();
  const { setIsLoading } = useLoadingStore();
  const [aggregate, setAggregate] = useState<SprayingAggregate | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [zones, setZones] = useState<SprayingZoneOption[]>(() => getSprayingZonesSnapshot(queryClient));
  const [selectedZone, setSelectedZone] = useState<SprayingZoneOption | null>(null);
  const [selectedZonePlants, setSelectedZonePlants] = useState<SprayingPlant[]>([]);
  const [trackingState, setTrackingState] = useState<SprayingTrackingReconciliation>('inactive');
  const [operationsList, setOperationsList] = useState<LocalSprayingOperation[]>([]);
  const [activeView, setActiveView] = useState<'list' | 'map'>('list');
  const [isZoneSelectionVisible, setIsZoneSelectionVisible] = useState(false);
  const [isSetupVisible, setIsSetupVisible] = useState(false);
  const [isReviewVisible, setIsReviewVisible] = useState(false);
  const activeOperationIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeOperationIdRef.current = aggregate?.operation.id ?? null;
  }, [aggregate]);

  useEffect(() => {
    let mounted = true;

    void repository.local.listLoadedZones().then((loadedZones) => {
      if (mounted) setZones(loadedZones.map((zone) => ({ id: zone.id, name: zone.name })));
    });

    return () => {
      mounted = false;
    };
  }, [repository]);

  const refreshOperationsList = useCallback(async () => {
    const list = await repository.local.listOperations();
    setOperationsList(list);
  }, [repository]);

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

  const restoreLoadedZone = useCallback(async () => {
    const loadedZone = await getLoadedSprayingZone();
    if (!loadedZone) {
      setSelectedZone(null);
      setSelectedZonePlants([]);
      return;
    }

    const plants = await repository.local.getZonePlants(loadedZone.id);
    if (plants.length === 0) {
      await clearLoadedSprayingZone();
      setSelectedZone(null);
      setSelectedZonePlants([]);
      return;
    }

    setSelectedZone(loadedZone);
    setSelectedZonePlants(plants);
  }, [repository]);

  const refresh = useCallback(async () => {
    await refreshOperationsList();
    const recoverable = await repository.local.getRecoverableOperation();
    if (!recoverable) {
      activeOperationIdRef.current = null;
      setAggregate(null);
      await restoreLoadedZone();
      setTrackingState(await reconcileSprayingLocationUpdates(null));
      return;
    }

    await refreshOperation(recoverable.id);
    if (recoverable.lifecycle_status === 'tracking') {
      setTrackingState(await reconcileSprayingLocationUpdates(recoverable.id));
    } else {
      setTrackingState('inactive');
    }
  }, [refreshOperation, refreshOperationsList, repository, restoreLoadedZone]);

  useEffect(() => {
    let mounted = true;
    let locationSubscription: Location.LocationSubscription | null = null;

    void refresh();

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
  }, [refresh]);

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
        if (cachedPlants.length === 0) {
          throw new Error('Nenhuma planta carregada para essa zona.');
        }
        setSelectedZone(zone);
        setSelectedZonePlants(cachedPlants);
        await saveLoadedSprayingZone(zone);

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
    if (!aggregate && selectedZonePlants.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      if (aggregate?.operation.lifecycle_status === 'tracking') {
        await stopSprayingLocationUpdates();
      }
      if (aggregate) {
        await repository.local.deleteOperation(aggregate.operation.id);
      }
      await clearLoadedSprayingZone();
      activeOperationIdRef.current = null;
      setAggregate(null);
      setSelectedZone(null);
      setSelectedZonePlants([]);
      setTrackingState('inactive');
      setIsReviewVisible(false);
      setIsSetupVisible(false);
      setMessage(aggregate ? 'Pulverização local excluida.' : 'Plantas carregadas removidas.');
      setIsVisible(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }, [aggregate, repository, selectedZonePlants.length, setIsLoading, setIsVisible, setMessage]);

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

  const openListView = useCallback(() => {
    setActiveView('list');
    void refreshOperationsList();
  }, [refreshOperationsList]);

  const openMapView = useCallback(
    async (operationId?: string) => {
      if (operationId) {
        await refreshOperation(operationId);
      } else {
        const recoverable = await repository.local.getRecoverableOperation();
        if (recoverable && recoverable.lifecycle_status === 'tracking') {
          await refreshOperation(recoverable.id);
        } else {
          setAggregate(null);
          await restoreLoadedZone();
        }
      }
      setActiveView('map');
    },
    [refreshOperation, repository, restoreLoadedZone],
  );

  const deleteOperationById = useCallback(
    async (operationId: string) => {
      setIsLoading(true);
      try {
        const targetOp = await repository.local.getOperation(operationId);
        if (targetOp?.lifecycle_status === 'tracking') {
          await stopSprayingLocationUpdates();
        }
        await repository.local.deleteOperation(operationId);
        if (activeOperationIdRef.current === operationId) {
          await clearLoadedSprayingZone();
          activeOperationIdRef.current = null;
          setAggregate(null);
          setSelectedZone(null);
          setSelectedZonePlants([]);
          setTrackingState('inactive');
          setIsReviewVisible(false);
          setIsSetupVisible(false);
        }

        await refreshOperationsList();
        setMessage('Pulverização excluída!');
        setIsVisible(true);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : String(error));
        setIsVisible(true);
      } finally {
        setIsLoading(false);
      }
    },
    [repository, setIsLoading, setIsVisible, setMessage, refreshOperationsList],
  );

  const finishTracking = useCallback(async () => {
    if (!aggregate || aggregate.operation.lifecycle_status !== 'tracking') {
      return;
    }

    setIsLoading(true);
    try {
      await stopSprayingLocationUpdates();

      const points = await repository.local.listTrackPoints(aggregate.operation.id);
      if (points.length < 2) {
        await startSprayingLocationUpdates(aggregate.operation.id, aggregate.operation.device_id);
        throw new Error('A rota precisa de pelo menos dois pontos GPS validos.');
      }

      await repository.local.finishTracking(aggregate.operation.id);
      const operation = await repository.local.getOperation(aggregate.operation.id);
      if (!operation) {
        throw new Error('Operação local não encontrada.');
      }

      const route = consolidateSprayingRoute(points);
      await repository.local.saveConsolidatedRoute(operation, route);

      // Run simulation automatically so the list card shows candidate/confirmed counts
      const matches = simulateSprayingPlants({
        plants: aggregate.plants,
        points,
        minDistanceMeters: operation.min_distance_meters,
        maxDistanceMeters: operation.max_distance_meters,
      });
      await repository.local.saveSimulation(operation.id, matches);
      await repository.local.confirmAllAutomaticCandidates(operation.id, operation.device_id);

      setTrackingState('inactive');
      await refreshOperationsList();
      setActiveView('list');
      setMessage('Pulverização finalizada com sucesso.');
      setIsVisible(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }, [aggregate, refreshOperationsList, repository, setIsLoading, setIsVisible, setMessage]);

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
    await refreshOperationsList();
    setIsReviewVisible(false);
    setActiveView('list');
  }, [aggregate, refreshOperation, refreshOperationsList, repository]);

  const syncOperationById = useCallback(
    async (operationId: string) => {
      setIsLoading(true);
      try {
        let opAggregate =
          aggregate?.operation.id === operationId ? aggregate : await repository.local.getAggregate(operationId);

        if (!opAggregate) {
          throw new Error('Operação local não encontrada.');
        }

        if (opAggregate.operation.lifecycle_status === 'finished') {
          const matches = simulateSprayingPlants({
            plants: opAggregate.plants,
            points: opAggregate.trackPoints,
            minDistanceMeters: opAggregate.operation.min_distance_meters,
            maxDistanceMeters: opAggregate.operation.max_distance_meters,
          });
          await repository.local.saveSimulation(opAggregate.operation.id, matches);
          await repository.local.confirmAllAutomaticCandidates(
            opAggregate.operation.id,
            opAggregate.operation.device_id,
          );
          await repository.local.markReviewed(opAggregate.operation.id);
          opAggregate = await repository.local.getAggregate(operationId);
        } else if (opAggregate.operation.lifecycle_status === 'simulated') {
          await repository.local.markReviewed(opAggregate.operation.id);
          opAggregate = await repository.local.getAggregate(operationId);
        }

        if (!opAggregate || !['reviewed', 'sync_error'].includes(opAggregate.operation.lifecycle_status)) {
          throw new Error('A Pulverização precisa estar finalizada ou revisada para sincronizar.');
        }

        const payload = await repository.local.buildSyncPayload(opAggregate.operation.id);
        await repository.local.markSyncing(opAggregate.operation.id);
        await refreshOperationsList();
        if (activeOperationIdRef.current === operationId) {
          await refreshOperation(operationId);
        }

        const { data, error } = await repository.syncReviewedOperation(payload);
        if (error || !data) {
          throw new Error(error?.message ?? 'A RPC de Pulverização não retornou dados.');
        }

        await repository.local.markSynced(opAggregate.operation.id, data);
        if (activeOperationIdRef.current === operationId) {
          activeOperationIdRef.current = null;
          setAggregate(null);
          setSelectedZonePlants((currentPlants) => clearSprayingReviewState(currentPlants));
          setTrackingState('inactive');
          setIsReviewVisible(false);
          setIsSetupVisible(false);
        }
        await refreshOperationsList();
        setMessage('Pulverização sincronizada com sucesso.');
        setIsVisible(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await repository.local.markSyncError(operationId, message);
        if (activeOperationIdRef.current === operationId) {
          await refreshOperation(operationId);
        }
        await refreshOperationsList();
        setMessage(`Erro ao sincronizar Pulverização.\n${message}`);
        setIsVisible(true);
      } finally {
        setIsLoading(false);
      }
    },
    [aggregate, refreshOperation, refreshOperationsList, repository, setIsLoading, setIsVisible, setMessage],
  );

  const syncOperation = useCallback(async () => {
    if (!aggregate) {
      return;
    }
    await syncOperationById(aggregate.operation.id);
  }, [aggregate, syncOperationById]);

  return (
    <SprayingContext.Provider
      value={{
        aggregate,
        currentLocation,
        zones,
        selectedZone,
        selectedZonePlants,
        trackingState,
        operationsList,
        activeView,
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
        openListView,
        openMapView,
        beginOperation,
        deleteActiveOperation,
        deleteOperationById,
        prepareRouteSimulation,
        recordSimulatedLocation,
        startTracking,
        finishTracking,
        simulate,
        togglePlant,
        confirmReview,
        syncOperation,
        syncOperationById,
        refreshOperationsList,
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
