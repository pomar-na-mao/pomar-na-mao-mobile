import { newPlantsRepository, type SupabaseNewPlant } from '@/data/repositories/new-plants/new-plants-repository';
import { useNewPlantsSqliteService } from '@/data/services/new-plants/use-new-plants-sqlite-service';
import type { Region } from '@/domain/models/shared/geolocation.model';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AddPlantContextProps {
  initialRegion: Region | null;
  userLocation: Location.LocationObject | null;
  permissionDenied: boolean;
  submitPlant: (region: string) => Promise<boolean>;
  sendPlants: () => Promise<void>;
  deletePendingPlants: () => Promise<void>;
  pendingCount: number;
}

const AddPlantContext = createContext({} as AddPlantContextProps);

export const AddPlantProvider = ({ children }: { children: React.ReactNode }) => {
  const { create, searchAll, remove } = useNewPlantsSqliteService();
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const { setMessage, setIsVisible } = useAlertBoxStore();
  const { setIsLoading } = useLoadingStore();

  const refreshPendingCount = useCallback(async () => {
    const plants = await searchAll();
    setPendingCount(plants?.length ?? 0);
  }, [searchAll]);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  useEffect(() => {
    let mounted = true;
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (!mounted) return;

      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      if (!mounted) return;

      const { latitude, longitude } = currentLocation.coords;

      setUserLocation(currentLocation);
      setInitialRegion({
        latitude,
        longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      });

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 3,
        },
        (newLocation) => {
          if (!mounted) return;
          setUserLocation(newLocation);
        },
      );
    })();

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  async function submitPlant(region: string): Promise<boolean> {
    if (!region.trim()) {
      setMessage('Por favor, insira a região.');
      setIsVisible(true);
      return false;
    }

    if (!userLocation) return false;

    setIsLoading(true);

    try {
      const result = await create({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        gps_timestamp: Date.now(),
        created_at: new Date().toISOString(),
        region: region.trim(),
      });

      setMessage(`Planta #${result.insertedRowId} adicionada localmente!`);
      setIsVisible(true);
      await refreshPendingCount();
      return true;
    } catch {
      setMessage('Ocorreu um erro ao salvar a planta.');
      setIsVisible(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function sendPlants(): Promise<void> {
    setIsLoading(true);

    const networkState = await Network.getNetworkStateAsync();
    const isConnected = networkState.isConnected ?? false;

    if (!isConnected) {
      setMessage('Sem conexão com a internet. Conecte-se e tente novamente.');
      setIsVisible(true);
      setIsLoading(false);
      return;
    }

    const plants = await searchAll();

    if (!plants || plants.length === 0) {
      setMessage('Nenhuma planta pendente para envio.');
      setIsVisible(true);
      setIsLoading(false);
      return;
    }

    try {
      const mappedPlants: SupabaseNewPlant[] = plants.map((plant) => ({
        latitude: plant.latitude,
        longitude: plant.longitude,
        gps_timestamp: plant.gps_timestamp,
        created_at: plant.created_at,
        region: plant.region,
      }));

      const { error } = await newPlantsRepository.insert(mappedPlants);

      if (error) {
        setMessage('Erro ao enviar as plantas!\n' + JSON.stringify(error));
        setIsVisible(true);
      } else {
        for (const p of plants) {
          await remove(p.id);
        }

        setMessage('Plantas enviadas com sucesso.');
        setIsVisible(true);
        await refreshPendingCount();
      }
    } catch {
      setMessage('Erro inesperado ao enviar as plantas.');
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function deletePendingPlants(): Promise<void> {
    setIsLoading(true);
    try {
      const plants = await searchAll();
      if (plants && plants.length > 0) {
        for (const p of plants) {
          await remove(p.id);
        }
        setMessage('Registros pendentes descartados.');
        setIsVisible(true);
      }
      await refreshPendingCount();
    } catch {
      setMessage('Erro ao descartar registros.');
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AddPlantContext.Provider
      value={{
        initialRegion,
        userLocation,
        permissionDenied,
        submitPlant,
        sendPlants,
        deletePendingPlants,
        pendingCount,
      }}
    >
      {children}
    </AddPlantContext.Provider>
  );
};

export const useAddPlant = () => useContext(AddPlantContext);
