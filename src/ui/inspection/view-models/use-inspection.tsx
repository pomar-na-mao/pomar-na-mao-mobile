import { inspectionRepository } from '@/data/repositories/inspection/inspection-repository';
import { useInspectionSqliteService } from '@/data/services/inspection/use-inspection-sqlite-service';
import {
  localInspectionChangeToOccurrenceProjection,
  projectInspectionPlantOccurrences,
  type InspectionChangeType,
  type InspectionFilter,
  type InspectionFilterOptions,
  type InspectionListItem,
  type InspectionPlant,
  type LocalInspection,
  type OccurrenceTypeOption,
} from '@/domain/models/inspection';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { getInspectionDeviceId } from '@/ui/inspection/helpers/device';
import { getInspectionFilterOptionsSnapshot } from '@/ui/shared/hooks/use-field-work-data';
import {
  findNearestInspectionPlant,
  MEANINGFUL_DISTANCE_CHANGE_METERS,
  shouldKeepCurrentNearestPlant,
  shouldPersistNearestPlant,
} from '@/ui/inspection/helpers/nearest-plant';
import { twoPointsDistance } from '@/utils/geolocation/geolocation-math';
import { useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

interface SaveOccurrenceChangeParams {
  changeType: InspectionChangeType;
  occurrence: OccurrenceTypeOption;
  severity?: string | null;
  notes?: string | null;
}

interface LocationUpdateOptions {
  source?: 'device' | 'simulation';
}

interface InspectionContextProps {
  currentLocation: Location.LocationObject | null;
  initialRegion: Location.LocationObjectCoords | null;
  activeInspection: LocalInspection | null;
  loadedPlants: InspectionPlant[];
  nearestPlant: InspectionPlant | null;
  inspections: InspectionListItem[];
  filterOptions: InspectionFilterOptions;
  isFilterModalVisible: boolean;
  isNearestPlantModalVisible: boolean;
  openFilterModal(): void;
  closeFilterModal(): void;
  openNearestPlantModal(): void;
  closeNearestPlantModal(): void;
  applyLocationUpdate(location: Location.LocationObject, options?: LocationUpdateOptions): void;
  applyFilters(filters: InspectionFilter): Promise<void>;
  saveOccurrenceChange(params: SaveOccurrenceChangeParams): Promise<void>;
  setLocationSimulationActive(isActive: boolean): void;
  finishActiveInspection(): Promise<void>;
  syncInspection(inspectionId: string): Promise<void>;
  refreshInspections(): Promise<void>;
}

const INSPECTION_LOCATION_DISTANCE_INTERVAL_METERS = 0;
const INSPECTION_LOCATION_TIME_INTERVAL_MS = 250;

const InspectionContext = createContext({} as InspectionContextProps);

export const InspectionProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const sqliteService = useInspectionSqliteService();
  const { setMessage, setIsVisible } = useAlertBoxStore();
  const { setIsLoading } = useLoadingStore();

  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [activeInspection, setActiveInspection] = useState<LocalInspection | null>(null);
  const [loadedPlants, setLoadedPlants] = useState<InspectionPlant[]>([]);
  const [nearestPlant, setNearestPlant] = useState<InspectionPlant | null>(null);
  const [inspections, setInspections] = useState<InspectionListItem[]>([]);
  const [filterOptions, setFilterOptions] = useState<InspectionFilterOptions>(() =>
    getInspectionFilterOptionsSnapshot(queryClient),
  );
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isNearestPlantModalVisible, setIsNearestPlantModalVisible] = useState(false);

  const activeInspectionRef = useRef<LocalInspection | null>(null);
  const isFilterModalVisibleRef = useRef(false);
  const isLocationSimulationActiveRef = useRef(false);
  const latestDeviceLocationRef = useRef<Location.LocationObject | null>(null);
  const loadedPlantsRef = useRef<InspectionPlant[]>([]);
  const lastPersistedNearestRef = useRef<{ plantId: string; distance: number } | null>(null);
  const nearestPlantRef = useRef<InspectionPlant | null>(null);

  const initialRegion = useMemo(() => currentLocation?.coords ?? null, [currentLocation]);

  useEffect(() => {
    activeInspectionRef.current = activeInspection;
  }, [activeInspection]);

  useEffect(() => {
    isFilterModalVisibleRef.current = isFilterModalVisible;
  }, [isFilterModalVisible]);

  useEffect(() => {
    loadedPlantsRef.current = loadedPlants;
  }, [loadedPlants]);

  useEffect(() => {
    nearestPlantRef.current = nearestPlant;
  }, [nearestPlant]);

  const refreshInspections = useCallback(async () => {
    const inspectionItems = await sqliteService.listInspections();
    setInspections(inspectionItems);
  }, [sqliteService]);

  useEffect(() => {
    let mounted = true;

    void sqliteService.getLoadedFieldWorkZones().then((loadedZones) => {
      if (!mounted) return;
      const loadedZoneIds = new Set(loadedZones.map((zone) => zone.id));
      setFilterOptions((current) => ({
        ...current,
        zones: current.zones.filter((zone) => loadedZoneIds.has(zone.id)),
      }));
    });

    return () => {
      mounted = false;
    };
  }, [sqliteService]);

  const restoreInspectionState = useCallback(async () => {
    const pendingInspection = await sqliteService.getLatestPendingInspection();

    if (pendingInspection) {
      const plants = await sqliteService.getLoadedPlants(pendingInspection.id);
      const restoredNearestPlant = plants.find((plant) => plant.isNearest) ?? null;
      activeInspectionRef.current = pendingInspection;
      loadedPlantsRef.current = plants;
      nearestPlantRef.current = restoredNearestPlant;
      setActiveInspection(pendingInspection);
      setLoadedPlants(plants);
      setNearestPlant(restoredNearestPlant);
      lastPersistedNearestRef.current = null;
      return;
    }

    const latestInspection = await sqliteService.getLatestInspection();

    if (latestInspection) {
      const plants = await sqliteService.getLoadedPlants(latestInspection.id);
      activeInspectionRef.current = null;
      loadedPlantsRef.current = plants;
      nearestPlantRef.current = null;
      setActiveInspection(null);
      setLoadedPlants(plants);
      setNearestPlant(null);
      lastPersistedNearestRef.current = null;
    }
  }, [sqliteService]);

  const evaluateNearestPlantFromLocation = useCallback(
    (location: Location.LocationObject) => {
      const plants = loadedPlantsRef.current;

      if (plants.length === 0 || isFilterModalVisibleRef.current) {
        if (nearestPlantRef.current) {
          nearestPlantRef.current = null;
          setNearestPlant(null);
        }
        return;
      }

      const nearest = findNearestInspectionPlant(location, plants, nearestPlantRef.current?.plantId);

      if (!nearest) {
        if (nearestPlantRef.current) {
          nearestPlantRef.current = null;
          setNearestPlant(null);
        }
        return;
      }

      const previous = nearestPlantRef.current;

      if (
        shouldKeepCurrentNearestPlant({
          candidateDistanceMeters: nearest.distance,
          candidatePlantId: nearest.plant.plantId,
          currentLocation: location,
          currentNearestPlant: previous,
        })
      ) {
        return;
      }

      const nextNearest = {
        ...nearest.plant,
        isNearest: true,
        distanceMeters: nearest.distance,
      };

      const isSameNearest =
        previous?.plantId === nextNearest.plantId &&
        Math.abs((previous.distanceMeters ?? 0) - nearest.distance) < MEANINGFUL_DISTANCE_CHANGE_METERS;

      if (!isSameNearest) {
        nearestPlantRef.current = nextNearest;
        setNearestPlant(nextNearest);

        setLoadedPlants((currentPlants) => {
          let changed = false;
          const nextPlants = currentPlants.map((plant) => {
            const isNearestPlant = plant.plantId === nextNearest.plantId;
            const nextDistance = isNearestPlant ? nearest.distance : plant.distanceMeters;

            if (plant.isNearest !== isNearestPlant || plant.distanceMeters !== nextDistance) {
              changed = true;
              return {
                ...plant,
                isNearest: isNearestPlant,
                distanceMeters: nextDistance,
              };
            }

            return plant;
          });

          if (changed) {
            loadedPlantsRef.current = nextPlants;
            return nextPlants;
          }

          return currentPlants;
        });
      }

      const activeInspectionSnapshot = activeInspectionRef.current;
      const lastPersistedNearest = lastPersistedNearestRef.current;
      const shouldPersist = shouldPersistNearestPlant({
        candidateDistanceMeters: nearest.distance,
        candidatePlantId: nextNearest.plantId,
        lastPersistedNearest,
      });

      if (activeInspectionSnapshot && shouldPersist) {
        lastPersistedNearestRef.current = {
          plantId: nextNearest.plantId,
          distance: nearest.distance,
        };

        sqliteService
          .updateNearestPlant({
            inspectionId: activeInspectionSnapshot.id,
            plantId: nextNearest.plantId,
            userLatitude: location.coords.latitude,
            userLongitude: location.coords.longitude,
            distanceMeters: nearest.distance,
          })
          .catch((error) => {
            console.error('Erro ao persistir planta mais próxima.', error);
          });
      }
    },
    [sqliteService],
  );

  const applyLocationUpdate = useCallback(
    (location: Location.LocationObject, options?: LocationUpdateOptions) => {
      const source = options?.source ?? 'device';

      if (source === 'device') {
        latestDeviceLocationRef.current = location;
      }

      if (__DEV__ && isLocationSimulationActiveRef.current && source !== 'simulation') {
        return;
      }

      setCurrentLocation(location);
      evaluateNearestPlantFromLocation(location);
    },
    [evaluateNearestPlantFromLocation],
  );

  const setLocationSimulationActive = useCallback(
    (isActive: boolean) => {
      if (!__DEV__) {
        return;
      }

      const wasActive = isLocationSimulationActiveRef.current;
      isLocationSimulationActiveRef.current = isActive;

      if (wasActive && !isActive && latestDeviceLocationRef.current) {
        applyLocationUpdate(latestDeviceLocationRef.current);
      }
    },
    [applyLocationUpdate],
  );

  useEffect(() => {
    let mounted = true;
    let subscription: Location.LocationSubscription | null = null;

    refreshInspections();
    restoreInspectionState();

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (!mounted) return;

      if (status !== 'granted') {
        setMessage('Permissão de localização negada. Habilite a localização para usar a inspeção.');
        setIsVisible(true);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      if (!mounted) return;

      applyLocationUpdate(location);

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: INSPECTION_LOCATION_DISTANCE_INTERVAL_METERS,
          timeInterval: INSPECTION_LOCATION_TIME_INTERVAL_MS,
        },
        (newLocation) => {
          if (mounted) {
            applyLocationUpdate(newLocation);
          }
        },
      );
    })();

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, [applyLocationUpdate, refreshInspections, restoreInspectionState, setIsVisible, setMessage]);

  useEffect(() => {
    if (currentLocation) {
      evaluateNearestPlantFromLocation(currentLocation);
    }
  }, [currentLocation, evaluateNearestPlantFromLocation, isFilterModalVisible, loadedPlants]);

  const applyFilters = useCallback(
    async (filters: InspectionFilter) => {
      if (!filters.zoneId) {
        setMessage('Selecione uma zona com plantas carregadas para iniciar a inspeção.');
        setIsVisible(true);
        return;
      }

      setIsLoading(true);

      try {
        const plants = await sqliteService.getFieldWorkPlants(filters);

        if (plants.length === 0) {
          setMessage('Nenhuma planta encontrada para os filtros selecionados.');
          setIsVisible(true);
          return;
        }

        const inspection = await sqliteService.createInspection(filters, plants);
        activeInspectionRef.current = inspection;
        loadedPlantsRef.current = plants;
        nearestPlantRef.current = null;
        setActiveInspection(inspection);
        setLoadedPlants(plants);
        setNearestPlant(null);
        lastPersistedNearestRef.current = null;
        setIsFilterModalVisible(false);
        await refreshInspections();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setMessage('Erro ao iniciar inspeção.\n' + message);
        setIsVisible(true);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshInspections, setIsLoading, setIsVisible, setMessage, sqliteService],
  );

  const saveOccurrenceChange = useCallback(
    async ({ changeType, occurrence, severity, notes }: SaveOccurrenceChangeParams) => {
      if (!nearestPlant) {
        setMessage('Nenhuma planta próxima selecionada para editar.');
        setIsVisible(true);
        return;
      }

      if (!activeInspection) {
        setMessage('Nenhuma inspeção ativa. Aplique um filtro para iniciar uma nova inspeção.');
        setIsVisible(true);
        return;
      }

      const localPlantChanges = await sqliteService.getChanges(activeInspection.id);
      const projectedOccurrences = projectInspectionPlantOccurrences(
        nearestPlant.occurrences,
        localPlantChanges
          .filter((change) => change.plant_id === nearestPlant.plantId)
          .map(localInspectionChangeToOccurrenceProjection),
      );
      const existingOccurrence = projectedOccurrences.find(
        (item) => item.occurrenceTypeId === occurrence.id && item.status === 'open',
      );

      if (changeType !== 'add_occurrence' && !existingOccurrence) {
        setMessage('Selecione uma ocorrência existente para atualizar ou resolver.');
        setIsVisible(true);
        return;
      }

      const distanceToPlantMeters = currentLocation
        ? twoPointsDistance(
            {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            },
            nearestPlant,
          )
        : nearestPlant.distanceMeters;
      const newOccurrenceStatus = changeType === 'remove_occurrence' ? 'removed' : 'open';

      await sqliteService.addInspectionChange({
        inspectionId: activeInspection.id,
        plant: nearestPlant,
        changeType,
        occurrenceTypeId: occurrence.id,
        occurrenceCode: occurrence.code,
        occurrenceName: occurrence.name,
        previousValue: existingOccurrence ?? null,
        newValue: {
          occurrenceTypeId: occurrence.id,
          code: occurrence.code,
          name: occurrence.name,
          severity: severity ?? null,
          notes: notes ?? null,
          status: newOccurrenceStatus,
        },
        severity: severity ?? null,
        notes: notes ?? null,
        latitude: currentLocation?.coords.latitude ?? null,
        longitude: currentLocation?.coords.longitude ?? null,
        gpsAccuracyM: currentLocation?.coords.accuracy ?? null,
        distanceToPlantMeters: distanceToPlantMeters ?? null,
      });

      const updatedPlants = await sqliteService.getLoadedPlants(activeInspection.id);
      const updatedInspection = await sqliteService.getInspectionById(activeInspection.id);
      const updatedNearestPlant = updatedPlants.find((plant) => plant.plantId === nearestPlant.plantId) ?? nearestPlant;
      loadedPlantsRef.current = updatedPlants;
      nearestPlantRef.current = updatedNearestPlant;
      setLoadedPlants(updatedPlants);
      setNearestPlant(updatedNearestPlant);
      if (updatedInspection) {
        activeInspectionRef.current = updatedInspection;
        setActiveInspection(updatedInspection);
      }
      await refreshInspections();
      setMessage('Alteração salva localmente.');
      setIsVisible(true);
    },
    [activeInspection, currentLocation, nearestPlant, refreshInspections, setIsVisible, setMessage, sqliteService],
  );

  const finishActiveInspection = useCallback(async () => {
    if (!activeInspection) {
      setMessage('Nenhuma inspeção ativa para finalizar.');
      setIsVisible(true);
      return;
    }

    await sqliteService.finishInspection(activeInspection.id);
    const updatedInspection = await sqliteService.getInspectionById(activeInspection.id);
    if (updatedInspection) {
      activeInspectionRef.current = updatedInspection;
      setActiveInspection(updatedInspection);
    }
    await refreshInspections();
    setMessage('Inspeção finalizada localmente.');
    setIsVisible(true);
  }, [activeInspection, refreshInspections, setIsVisible, setMessage, sqliteService]);

  const syncInspection = useCallback(
    async (inspectionId: string) => {
      setIsLoading(true);

      try {
        const activeInspectionSnapshot = activeInspectionRef.current;
        const payload = await sqliteService.buildSyncPayload(inspectionId, getInspectionDeviceId());

        if (payload.plantsChanged.length === 0) {
          setMessage('A inspeção não possui plantas alteradas para sincronizar.');
          setIsVisible(true);
          return;
        }

        await sqliteService.markInspectionSyncing(inspectionId);
        await refreshInspections();

        const { data, error } = await inspectionRepository.syncManualInspection(payload);

        if (error || !data) {
          const message = error?.message ?? 'A RPC sync_manual_inspection não retornou dados.';
          await sqliteService.markInspectionSyncError(inspectionId, message);
          setMessage('Erro ao sincronizar inspeção.\n' + message);
          setIsVisible(true);
          return;
        }

        await sqliteService.markInspectionSynced(inspectionId, data);
        await sqliteService.clearLoadedPlantsChangedState(inspectionId);

        if (activeInspectionSnapshot?.id === inspectionId) {
          activeInspectionRef.current = null;
          loadedPlantsRef.current = [];
          nearestPlantRef.current = null;
          setActiveInspection(null);
          setLoadedPlants([]);
          setNearestPlant(null);
        }

        setMessage('Inspeção sincronizada com sucesso.');
        lastPersistedNearestRef.current = null;
        setIsVisible(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await sqliteService.markInspectionSyncError(inspectionId, message);
        setMessage('Erro ao sincronizar inspeção.\n' + message);
        setIsVisible(true);
      } finally {
        await refreshInspections();
        setIsLoading(false);
      }
    },
    [refreshInspections, setIsLoading, setIsVisible, setMessage, sqliteService],
  );

  const openNearestPlantModal = useCallback(() => {
    if (!nearestPlant) {
      setMessage('Nenhuma planta próxima encontrada. Carregue plantas e aproxime-se de uma delas.');
      setIsVisible(true);
      return;
    }

    setIsNearestPlantModalVisible(true);
  }, [nearestPlant, setIsVisible, setMessage]);

  return (
    <InspectionContext.Provider
      value={{
        currentLocation,
        initialRegion,
        activeInspection,
        loadedPlants,
        nearestPlant,
        inspections,
        filterOptions,
        isFilterModalVisible,
        isNearestPlantModalVisible,
        openFilterModal: () => setIsFilterModalVisible(true),
        closeFilterModal: () => setIsFilterModalVisible(false),
        applyLocationUpdate,
        setLocationSimulationActive,
        openNearestPlantModal,
        closeNearestPlantModal: () => setIsNearestPlantModalVisible(false),
        applyFilters,
        saveOccurrenceChange,
        finishActiveInspection,
        syncInspection,
        refreshInspections,
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
};

export const useInspection = () => useContext(InspectionContext);
