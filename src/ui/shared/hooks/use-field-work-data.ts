import type { AnnotationOccurrenceTypeOption, AnnotationZoneOption } from '@/domain/models/annotation';
import type {
  InspectionFilterOptions,
  OccurrenceTypeOption,
  VarietyOption,
  ZoneOption,
} from '@/domain/models/inspection';
import type { SprayingZoneOption } from '@/domain/models/spraying';
import { fieldWorkOptionsCache } from '@/data/services/shared/field-work-options-cache';
import { fieldWorkOptionsService } from '@/data/services/shared/field-work-options-service';
import {
  createFieldWorkPlantCacheService,
  LOADED_FIELD_WORK_ZONES_QUERY_KEY,
  type LoadedFieldWorkZone,
} from '@/data/services/shared/field-work-plant-cache-service';
import { QueryClient, queryOptions, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type FieldWorkCardId = 'annotation' | 'inspection' | 'plantRegistration' | 'spraying';
export type FieldWorkCardState = 'loading' | 'ready' | 'unavailable';
type FieldWorkResourceState = FieldWorkCardState;

const queryDefaults = {
  gcTime: 1000 * 60 * 120,
  refetchOnMount: 'always',
  retry: false,
  staleTime: 0,
} as const;

async function loadAndCache<T>(load: () => Promise<T[]>, save: (data: T[]) => Promise<void>): Promise<T[]> {
  const data = await load();
  await save(data).catch(() => undefined);
  return data;
}

export const fieldWorkQueryOptions = {
  occurrenceTypes: queryOptions({
    ...queryDefaults,
    queryFn: () => loadAndCache(fieldWorkOptionsService.getOccurrenceTypes, fieldWorkOptionsCache.saveOccurrenceTypes),
    queryKey: ['field-work-options', 'occurrence-types'] as const,
  }),
  varieties: queryOptions({
    ...queryDefaults,
    queryFn: () => loadAndCache(fieldWorkOptionsService.getVarieties, fieldWorkOptionsCache.saveVarieties),
    queryKey: ['field-work-options', 'varieties'] as const,
  }),
  zones: queryOptions({
    ...queryDefaults,
    queryFn: () => loadAndCache(fieldWorkOptionsService.getZones, fieldWorkOptionsCache.saveZones),
    queryKey: ['field-work-options', 'zones'] as const,
  }),
};

interface FieldWorkResourceStates {
  occurrenceTypes: FieldWorkResourceState;
  plants: FieldWorkResourceState;
  varieties: FieldWorkResourceState;
  zones: FieldWorkResourceState;
}

function combineResourceStates(states: FieldWorkResourceState[]): FieldWorkCardState {
  if (states.includes('loading')) {
    return 'loading';
  }
  if (states.includes('unavailable')) {
    return 'unavailable';
  }
  return 'ready';
}

function combineOfflineResourceStates(states: FieldWorkResourceState[]): FieldWorkCardState {
  return states.every((state) => state === 'ready') ? 'ready' : 'unavailable';
}

export function resolveFieldWorkCardStates(
  resources: FieldWorkResourceStates,
  network: 'loading' | 'offline' | 'online',
): Record<FieldWorkCardId, FieldWorkCardState> {
  if (network === 'offline') {
    return {
      annotation: combineOfflineResourceStates([resources.zones, resources.occurrenceTypes]),
      inspection: combineOfflineResourceStates([
        resources.zones,
        resources.occurrenceTypes,
        resources.varieties,
        resources.plants,
      ]),
      plantRegistration: combineOfflineResourceStates([resources.zones, resources.varieties]),
      spraying: combineOfflineResourceStates([resources.zones, resources.plants]),
    };
  }
  if (network === 'loading') {
    return { annotation: 'loading', inspection: 'loading', plantRegistration: 'loading', spraying: 'loading' };
  }

  return {
    annotation: combineResourceStates([resources.zones, resources.occurrenceTypes]),
    inspection: combineResourceStates([
      resources.zones,
      resources.occurrenceTypes,
      resources.varieties,
      resources.plants,
    ]),
    plantRegistration: combineResourceStates([resources.zones, resources.varieties]),
    spraying: combineResourceStates([resources.zones, resources.plants]),
  };
}

function getResourceState<T>(query: UseQueryResult<T[]>): FieldWorkResourceState {
  if (query.isPending || query.isFetching) {
    return 'loading';
  }
  if (query.isError || query.isRefetchError || !query.data || query.data.length === 0) {
    return 'unavailable';
  }
  return 'ready';
}

function getNetworkState(networkState: Network.NetworkState): 'loading' | 'offline' | 'online' {
  if (networkState.isConnected === false || networkState.isInternetReachable === false) {
    return 'offline';
  }
  if (networkState.isConnected === undefined || networkState.isInternetReachable === undefined) {
    return 'loading';
  }
  return 'online';
}

const allFieldWorkQueries = Object.values(fieldWorkQueryOptions);

export async function hydrateFieldWorkOptionsCache(queryClient: QueryClient) {
  const cachedOptions = await fieldWorkOptionsCache.readAll();

  for (const resource of Object.keys(fieldWorkQueryOptions) as (keyof typeof fieldWorkQueryOptions)[]) {
    const cachedData = cachedOptions[resource];
    const queryKey = fieldWorkQueryOptions[resource].queryKey;

    if (cachedData !== null && queryClient.getQueryData(queryKey) === undefined) {
      queryClient.setQueryData(queryKey, cachedData);
    }
  }
}

export async function retryUnavailableFieldWorkQueries(queryClient: QueryClient) {
  const retries = allFieldWorkQueries.flatMap((options) => {
    const state = queryClient.getQueryState(options.queryKey);
    const data = queryClient.getQueryData<unknown[]>(options.queryKey);
    const isUnavailable = state?.status === 'error' || (state?.status === 'success' && (!data || data.length === 0));

    return isUnavailable
      ? [queryClient.refetchQueries({ exact: true, queryKey: options.queryKey, type: 'active' })]
      : [];
  });

  await Promise.all(retries);
}

export function getInspectionFilterOptionsSnapshot(queryClient: QueryClient): InspectionFilterOptions {
  return {
    occurrenceTypes:
      queryClient.getQueryData<OccurrenceTypeOption[]>(fieldWorkQueryOptions.occurrenceTypes.queryKey) ?? [],
    varieties: queryClient.getQueryData<VarietyOption[]>(fieldWorkQueryOptions.varieties.queryKey) ?? [],
    zones: queryClient.getQueryData<ZoneOption[]>(fieldWorkQueryOptions.zones.queryKey) ?? [],
  };
}

export function getAnnotationOptionsSnapshot(queryClient: QueryClient): {
  occurrenceTypes: AnnotationOccurrenceTypeOption[];
  zones: AnnotationZoneOption[];
} {
  const options = getInspectionFilterOptionsSnapshot(queryClient);
  return { occurrenceTypes: options.occurrenceTypes, zones: options.zones };
}

export function getSprayingZonesSnapshot(queryClient: QueryClient): SprayingZoneOption[] {
  return queryClient.getQueryData<SprayingZoneOption[]>(fieldWorkQueryOptions.zones.queryKey) ?? [];
}

export function getPlantRegistrationOptionsSnapshot(queryClient: QueryClient): {
  varieties: VarietyOption[];
  zones: ZoneOption[];
} {
  const options = getInspectionFilterOptionsSnapshot(queryClient);
  return { varieties: options.varieties, zones: options.zones };
}

export function useFieldWorkDataReadiness() {
  const queryClient = useQueryClient();
  const database = useSQLiteContext();
  const plantCacheService = useMemo(() => createFieldWorkPlantCacheService(database), [database]);
  const [isCacheHydrated, setIsCacheHydrated] = useState(false);
  const networkState = Network.useNetworkState();
  const network = getNetworkState(networkState);
  const previousNetwork = useRef(network);
  const enabled = isCacheHydrated && network === 'online';
  const occurrenceTypes = useQuery({ ...fieldWorkQueryOptions.occurrenceTypes, enabled });
  const varieties = useQuery({ ...fieldWorkQueryOptions.varieties, enabled });
  const zones = useQuery({ ...fieldWorkQueryOptions.zones, enabled });
  const loadedPlantZones = useQuery<LoadedFieldWorkZone[]>({
    queryKey: LOADED_FIELD_WORK_ZONES_QUERY_KEY,
    queryFn: plantCacheService.listLoadedZones,
    staleTime: Infinity,
  });

  useEffect(() => {
    let cancelled = false;

    void hydrateFieldWorkOptionsCache(queryClient).finally(() => {
      if (!cancelled) setIsCacheHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  useEffect(() => {
    const reconnected = previousNetwork.current === 'offline' && network === 'online';
    previousNetwork.current = network;

    if (reconnected) {
      void retryUnavailableFieldWorkQueries(queryClient);
    }
  }, [network, queryClient]);

  useFocusEffect(
    useCallback(() => {
      if (enabled) {
        void retryUnavailableFieldWorkQueries(queryClient);
      }
    }, [enabled, queryClient]),
  );

  if (!isCacheHydrated || loadedPlantZones.isPending) {
    return { annotation: 'loading', inspection: 'loading', plantRegistration: 'loading', spraying: 'loading' };
  }

  return resolveFieldWorkCardStates(
    {
      occurrenceTypes: getResourceState(occurrenceTypes),
      plants: getResourceState(loadedPlantZones),
      varieties: getResourceState(varieties),
      zones: getResourceState(zones),
    },
    network,
  );
}
