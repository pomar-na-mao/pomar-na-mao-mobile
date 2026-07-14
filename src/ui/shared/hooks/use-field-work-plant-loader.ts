import { inspectionRepository } from '@/data/repositories/inspection/inspection-repository';
import {
  createFieldWorkPlantCacheService,
  LOADED_FIELD_WORK_ZONES_QUERY_KEY,
} from '@/data/services/shared/field-work-plant-cache-service';
import { fieldWorkQueryOptions } from '@/ui/shared/hooks/use-field-work-data';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';

export function useFieldWorkPlantLoader() {
  const database = useSQLiteContext();
  const queryClient = useQueryClient();
  const cacheService = useMemo(() => createFieldWorkPlantCacheService(database), [database]);
  const networkState = Network.useNetworkState();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const zonesQuery = useQuery({ ...fieldWorkQueryOptions.zones, enabled: false });
  const loadedZonesQuery = useQuery({
    queryKey: LOADED_FIELD_WORK_ZONES_QUERY_KEY,
    queryFn: cacheService.listLoadedZones,
    staleTime: Infinity,
  });
  const isOnline = networkState.isConnected === true && networkState.isInternetReachable === true;

  const open = useCallback(() => {
    setError(null);
    setIsVisible(true);
  }, []);
  const close = useCallback(() => {
    if (!isLoading) setIsVisible(false);
  }, [isLoading]);

  const clearAllPlants = useCallback(async () => {
    await cacheService.clearAllPlants();
    await queryClient.invalidateQueries({ queryKey: LOADED_FIELD_WORK_ZONES_QUERY_KEY });
  }, [cacheService, queryClient]);

  const clearZonePlants = useCallback(
    async (zoneId: string) => {
      await cacheService.clearZonePlants(zoneId);
      await queryClient.invalidateQueries({ queryKey: LOADED_FIELD_WORK_ZONES_QUERY_KEY });
    },
    [cacheService, queryClient],
  );

  const loadZone = useCallback(
    async (zoneId: string) => {
      const zone = zonesQuery.data?.find((item) => item.id === zoneId);
      if (!zone) {
        setError('Selecione uma zona válida.');
        return;
      }
      if (!isOnline) {
        setError('Conecte-se à internet para carregar plantas.');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const { data, error: requestError } = await inspectionRepository.getInspectionPlants({
          zoneId: zone.id,
          zoneName: zone.name,
        });
        if (requestError) throw new Error(requestError.message);
        if (!data || data.length === 0) throw new Error('Nenhuma planta encontrada nessa zona.');

        await cacheService.replaceZonePlants(zone, data);
        await queryClient.invalidateQueries({ queryKey: LOADED_FIELD_WORK_ZONES_QUERY_KEY });
        setIsVisible(false);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
      } finally {
        setIsLoading(false);
      }
    },
    [cacheService, isOnline, queryClient, zonesQuery.data],
  );

  const totalPlants = (loadedZonesQuery.data ?? []).reduce((total, zone) => total + zone.plantCount, 0);

  return {
    clearAllPlants,
    clearZonePlants,
    close,
    error,
    isLoading,
    isOnline,
    isVisible,
    loadZone,
    loadedZones: loadedZonesQuery.data ?? [],
    open,
    totalPlants,
    zones: zonesQuery.data ?? [],
  };
}
