import type { AnnotationOccurrenceTypeOption, AnnotationZoneOption } from '@/domain/models/annotation';
import type {
  InspectionFilterOptions,
  OccurrenceTypeOption,
  VarietyOption,
  ZoneOption,
} from '@/domain/models/inspection';
import type { SprayingZoneOption } from '@/domain/models/spraying';
import { fieldWorkOptionsService } from '@/data/services/shared/field-work-options-service';
import { QueryClient, queryOptions, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export type FieldWorkCardId = 'annotation' | 'inspection' | 'spraying';
export type FieldWorkCardState = 'loading' | 'ready' | 'unavailable';
type FieldWorkResourceState = FieldWorkCardState;

const queryDefaults = {
  gcTime: 1000 * 60 * 120,
  retry: false,
  staleTime: Infinity,
} as const;

export const fieldWorkQueryOptions = {
  occurrenceTypes: queryOptions({
    ...queryDefaults,
    queryFn: () => fieldWorkOptionsService.getOccurrenceTypes(),
    queryKey: ['field-work-options', 'occurrence-types'] as const,
  }),
  varieties: queryOptions({
    ...queryDefaults,
    queryFn: () => fieldWorkOptionsService.getVarieties(),
    queryKey: ['field-work-options', 'varieties'] as const,
  }),
  zones: queryOptions({
    ...queryDefaults,
    queryFn: () => fieldWorkOptionsService.getZones(),
    queryKey: ['field-work-options', 'zones'] as const,
  }),
};

interface FieldWorkResourceStates {
  occurrenceTypes: FieldWorkResourceState;
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

export function resolveFieldWorkCardStates(
  resources: FieldWorkResourceStates,
  network: 'loading' | 'offline' | 'online',
): Record<FieldWorkCardId, FieldWorkCardState> {
  if (network === 'offline') {
    return { annotation: 'unavailable', inspection: 'unavailable', spraying: 'unavailable' };
  }
  if (network === 'loading') {
    return { annotation: 'loading', inspection: 'loading', spraying: 'loading' };
  }

  return {
    annotation: combineResourceStates([resources.zones, resources.occurrenceTypes]),
    inspection: combineResourceStates([resources.zones, resources.occurrenceTypes, resources.varieties]),
    spraying: combineResourceStates([resources.zones]),
  };
}

function getResourceState<T>(query: UseQueryResult<T[]>): FieldWorkResourceState {
  if (query.isPending) {
    return 'loading';
  }
  if (query.isError || !query.data || query.data.length === 0) {
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

export function useFieldWorkDataReadiness() {
  const queryClient = useQueryClient();
  const networkState = Network.useNetworkState();
  const network = getNetworkState(networkState);
  const enabled = network === 'online';
  const occurrenceTypes = useQuery({ ...fieldWorkQueryOptions.occurrenceTypes, enabled });
  const varieties = useQuery({ ...fieldWorkQueryOptions.varieties, enabled });
  const zones = useQuery({ ...fieldWorkQueryOptions.zones, enabled });

  useFocusEffect(
    useCallback(() => {
      if (enabled) {
        void retryUnavailableFieldWorkQueries(queryClient);
      }
    }, [enabled, queryClient]),
  );

  return resolveFieldWorkCardStates(
    {
      occurrenceTypes: getResourceState(occurrenceTypes),
      varieties: getResourceState(varieties),
      zones: getResourceState(zones),
    },
    network,
  );
}
