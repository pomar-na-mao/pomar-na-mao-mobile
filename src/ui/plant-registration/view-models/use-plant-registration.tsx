import { createPlantRegistrationRepository } from '@/data/repositories/plant-registration/plant-registration-repository';
import type {
  CreatePlantRegistrationParams,
  LocalPlantRegistration,
  PlantRegistrationFormValues,
} from '@/domain/models/plant-registration';
import { plantRegistrationFormSchema } from '@/domain/models/plant-registration';
import type { VarietyOption, ZoneOption } from '@/domain/models/inspection';
import {
  hasPreciseLocationPermission,
  isPlantRegistrationLocationAccepted,
  selectBestPlantRegistrationLocation,
} from '@/ui/plant-registration/helpers/plant-registration-location';
import { getPlantRegistrationOptionsSnapshot } from '@/ui/shared/hooks/use-field-work-data';
import { useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useSQLiteContext } from 'expo-sqlite';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type LocationState = 'idle' | 'loading' | 'ready' | 'error';

interface PlantRegistrationContextValue {
  plants: LocalPlantRegistration[];
  varieties: VarietyOption[];
  zones: ZoneOption[];
  currentLocation: Location.LocationObject | null;
  locationState: LocationState;
  locationError: string | null;
  isModalVisible: boolean;
  isSaving: boolean;
  isSyncingAll: boolean;
  openModal: () => void;
  closeModal: () => void;
  retryLocation: () => void;
  savePlant: (values: Omit<PlantRegistrationFormValues, 'latitude' | 'longitude'>) => Promise<boolean>;
  deletePlant: (id: string) => Promise<void>;
  deleteAllPlants: () => Promise<void>;
  syncPlant: (id: string) => Promise<void>;
  syncAllPlants: () => Promise<void>;
}

const PlantRegistrationContext = createContext<PlantRegistrationContextValue | null>(null);

export function PlantRegistrationProvider({ children }: React.PropsWithChildren) {
  const database = useSQLiteContext();
  const queryClient = useQueryClient();
  const repository = useMemo(() => createPlantRegistrationRepository(database), [database]);
  const options = useMemo(() => getPlantRegistrationOptionsSnapshot(queryClient), [queryClient]);
  const [plants, setPlants] = useState<LocalPlantRegistration[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isSyncingAll, setSyncingAll] = useState(false);
  const bestLocationRef = useRef<Location.LocationObject | null>(null);
  const locationRequestRef = useRef(0);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const refresh = useCallback(async () => setPlants(await repository.list()), [repository]);

  useEffect(() => {
    void repository.recoverInterruptedSyncs().then(refresh);
  }, [refresh, repository]);

  const stopLocationTracking = useCallback(() => {
    locationRequestRef.current += 1;
    locationSubscriptionRef.current?.remove();
    locationSubscriptionRef.current = null;
    bestLocationRef.current = null;
  }, []);

  const applyLocationUpdate = useCallback((location: Location.LocationObject) => {
    const selected = selectBestPlantRegistrationLocation(bestLocationRef.current, location);
    if (!selected || selected === bestLocationRef.current) return;

    bestLocationRef.current = selected;
    setCurrentLocation(selected);
    setLocationError(null);
    setLocationState('ready');
  }, []);

  const requestLocation = useCallback(async () => {
    stopLocationTracking();
    const requestId = locationRequestRef.current;
    setLocationState('loading');
    setLocationError(null);
    setCurrentLocation(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (requestId !== locationRequestRef.current) return;
      if (permission.status !== Location.PermissionStatus.GRANTED || !permission.granted) {
        throw new Error('Permita o acesso à localização para cadastrar a planta.');
      }
      if (!hasPreciseLocationPermission(permission)) {
        throw new Error('Ative a localização precisa nas configurações do aparelho.');
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 0,
          mayShowUserSettingsDialog: true,
          timeInterval: 1_000,
        },
        (location) => {
          if (requestId === locationRequestRef.current) applyLocationUpdate(location);
        },
      );
      if (requestId !== locationRequestRef.current) {
        subscription.remove();
        return;
      }
      locationSubscriptionRef.current = subscription;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        mayShowUserSettingsDialog: true,
      });
      if (requestId === locationRequestRef.current) applyLocationUpdate(location);
    } catch (error) {
      if (requestId !== locationRequestRef.current || bestLocationRef.current) return;
      setLocationState('error');
      setLocationError(error instanceof Error ? error.message : 'Não foi possível obter a localização atual.');
    }
  }, [applyLocationUpdate, stopLocationTracking]);

  useEffect(() => stopLocationTracking, [stopLocationTracking]);

  const openModal = useCallback(() => {
    setModalVisible(true);
    void requestLocation();
  }, [requestLocation]);

  const closeModal = useCallback(() => {
    if (!isSaving) {
      stopLocationTracking();
      setModalVisible(false);
    }
  }, [isSaving, stopLocationTracking]);

  const savePlant = useCallback(
    async (values: Omit<PlantRegistrationFormValues, 'latitude' | 'longitude'>) => {
      const location = bestLocationRef.current;
      if (!location || !isPlantRegistrationLocationAccepted(location)) return false;
      const gpsAccuracyM = location.coords.accuracy;
      if (gpsAccuracyM == null) return false;
      const parsed = plantRegistrationFormSchema.safeParse({
        ...values,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (!parsed.success) return false;

      const variety = options.varieties.find((item) => item.id === parsed.data.varietyId);
      const zone = options.zones.find((item) => item.id === parsed.data.zoneId);
      if (!variety || !zone) return false;

      const params: CreatePlantRegistrationParams = {
        ...parsed.data,
        gpsAccuracyM,
        gpsTimestamp: location.timestamp,
        varietyName: variety.name,
        zoneName: zone.name,
      };
      setSaving(true);
      try {
        await repository.create(params);
        await refresh();
        stopLocationTracking();
        setModalVisible(false);
        return true;
      } finally {
        setSaving(false);
      }
    },
    [options.varieties, options.zones, refresh, repository, stopLocationTracking],
  );

  const deletePlant = useCallback(
    async (id: string) => {
      await repository.deleteLocal(id);
      await refresh();
    },
    [refresh, repository],
  );

  const deleteAllPlants = useCallback(async () => {
    await repository.deleteAllLocal();
    await refresh();
  }, [refresh, repository]);

  const syncPlant = useCallback(
    async (id: string) => {
      try {
        await repository.sync(id);
      } catch {
        // The repository persisted the retryable error state.
      }
      await refresh();
    },
    [refresh, repository],
  );

  const syncAllPlants = useCallback(async () => {
    const pendingPlants = plants.filter(
      (plant) => plant.sync_status === 'pending_create' || plant.sync_status === 'error',
    );
    if (pendingPlants.length === 0 || isSyncingAll) return;

    setSyncingAll(true);
    try {
      for (const plant of pendingPlants) {
        try {
          await repository.sync(plant.id);
        } catch {
          // Each failed registration keeps its retryable error while the batch continues.
        }
      }
      await refresh();
    } finally {
      setSyncingAll(false);
    }
  }, [isSyncingAll, plants, refresh, repository]);

  return (
    <PlantRegistrationContext.Provider
      value={{
        plants,
        varieties: options.varieties,
        zones: options.zones,
        currentLocation,
        locationState,
        locationError,
        isModalVisible,
        isSaving,
        isSyncingAll,
        openModal,
        closeModal,
        retryLocation: requestLocation,
        savePlant,
        deleteAllPlants,
        deletePlant,
        syncAllPlants,
        syncPlant,
      }}
    >
      {children}
    </PlantRegistrationContext.Provider>
  );
}

export function usePlantRegistration() {
  const context = useContext(PlantRegistrationContext);
  if (!context) throw new Error('usePlantRegistration must be used inside PlantRegistrationProvider');
  return context;
}
