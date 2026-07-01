import { fieldWorkOptionsService } from '@/data/services/shared/field-work-options-service';
import { fieldWorkOptionsCache } from '@/data/services/shared/field-work-options-cache';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as Network from 'expo-network';
import { createElement, type PropsWithChildren } from 'react';
import {
  fieldWorkQueryOptions,
  getAnnotationOptionsSnapshot,
  getInspectionFilterOptionsSnapshot,
  getSprayingZonesSnapshot,
  resolveFieldWorkCardStates,
  retryUnavailableFieldWorkQueries,
  useFieldWorkDataReadiness,
} from './use-field-work-data';

jest.mock('expo-router', () => ({ useFocusEffect: jest.fn() }));
jest.mock('expo-network', () => ({ useNetworkState: jest.fn() }));
const mockListLoadedZones = jest.fn();
jest.mock('expo-sqlite', () => ({ useSQLiteContext: () => ({}) }));
jest.mock('@/data/services/shared/field-work-plant-cache-service', () => ({
  LOADED_FIELD_WORK_ZONES_QUERY_KEY: ['field-work-plants', 'loaded-zones'],
  createFieldWorkPlantCacheService: () => ({ listLoadedZones: mockListLoadedZones }),
}));
jest.mock('@/data/services/shared/field-work-options-service', () => ({
  fieldWorkOptionsService: {
    getOccurrenceTypes: jest.fn(),
    getVarieties: jest.fn(),
    getZones: jest.fn(),
  },
}));

const mockedNetwork = jest.mocked(Network);
const mockedFieldWorkOptionsService = jest.mocked(fieldWorkOptionsService);

const readyResources = {
  occurrenceTypes: 'ready',
  plants: 'ready',
  varieties: 'ready',
  zones: 'ready',
} as const;

describe('field-work data readiness', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockListLoadedZones.mockResolvedValue([{ id: 'zone-1', loadedAt: '2026-07-01', name: 'Talhao 1', plantCount: 1 }]);
    await AsyncStorage.clear();
  });

  it('marks every card ready when all dependencies are available online', () => {
    expect(resolveFieldWorkCardStates(readyResources, 'online')).toEqual({
      annotation: 'ready',
      inspection: 'ready',
      spraying: 'ready',
    });
  });

  it('keeps card failures independent by resource', () => {
    expect(resolveFieldWorkCardStates({ ...readyResources, occurrenceTypes: 'unavailable' }, 'online')).toEqual({
      annotation: 'unavailable',
      inspection: 'unavailable',
      spraying: 'ready',
    });
    expect(resolveFieldWorkCardStates({ ...readyResources, varieties: 'unavailable' }, 'online')).toEqual({
      annotation: 'ready',
      inspection: 'unavailable',
      spraying: 'ready',
    });
    expect(resolveFieldWorkCardStates({ ...readyResources, zones: 'unavailable' }, 'online')).toEqual({
      annotation: 'unavailable',
      inspection: 'unavailable',
      spraying: 'unavailable',
    });
    expect(resolveFieldWorkCardStates({ ...readyResources, plants: 'unavailable' }, 'online')).toEqual({
      annotation: 'ready',
      inspection: 'unavailable',
      spraying: 'unavailable',
    });
  });

  it('prioritizes loading online and preserves complete cached options offline', () => {
    expect(resolveFieldWorkCardStates({ ...readyResources, zones: 'loading' }, 'online')).toEqual({
      annotation: 'loading',
      inspection: 'loading',
      spraying: 'loading',
    });
    expect(resolveFieldWorkCardStates(readyResources, 'offline')).toEqual({
      annotation: 'ready',
      inspection: 'ready',
      spraying: 'ready',
    });
    expect(resolveFieldWorkCardStates({ ...readyResources, occurrenceTypes: 'loading' }, 'offline')).toEqual({
      annotation: 'unavailable',
      inspection: 'unavailable',
      spraying: 'ready',
    });
  });

  it('builds route snapshots exclusively from the shared cache', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
    const zones = [{ id: 'zone-1', name: 'Talhao 1' }];
    const occurrenceTypes = [{ code: 'PST', id: 'occurrence-1', name: 'Praga' }];
    const varieties = [{ id: 1, name: 'Gala' }];
    queryClient.setQueryData(fieldWorkQueryOptions.zones.queryKey, zones);
    queryClient.setQueryData(fieldWorkQueryOptions.occurrenceTypes.queryKey, occurrenceTypes);
    queryClient.setQueryData(fieldWorkQueryOptions.varieties.queryKey, varieties);

    expect(getInspectionFilterOptionsSnapshot(queryClient)).toEqual({ occurrenceTypes, varieties, zones });
    expect(getAnnotationOptionsSnapshot(queryClient)).toEqual({ occurrenceTypes, zones });
    expect(getSprayingZonesSnapshot(queryClient)).toEqual(zones);
  });

  it('retries only active failed or empty queries', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
    const refetch = jest.spyOn(queryClient, 'refetchQueries').mockResolvedValue(undefined);
    queryClient.setQueryData(fieldWorkQueryOptions.zones.queryKey, [{ id: 'zone-1', name: 'Talhao 1' }]);
    queryClient.setQueryData(fieldWorkQueryOptions.occurrenceTypes.queryKey, []);
    queryClient.setQueryData(fieldWorkQueryOptions.varieties.queryKey, [{ id: 1, name: 'Gala' }]);

    await retryUnavailableFieldWorkQueries(queryClient);

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(refetch).toHaveBeenCalledWith({
      exact: true,
      queryKey: fieldWorkQueryOptions.occurrenceTypes.queryKey,
      type: 'active',
    });
  });

  it('loads resources and updates card states when connectivity returns while mounted', async () => {
    mockedNetwork.useNetworkState.mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
    });
    mockedFieldWorkOptionsService.getZones.mockResolvedValue([{ id: 'zone-1', name: 'Talhao 1' }]);
    mockedFieldWorkOptionsService.getOccurrenceTypes.mockResolvedValue([
      { code: 'PST', id: 'occurrence-1', name: 'Praga' },
    ]);
    mockedFieldWorkOptionsService.getVarieties.mockResolvedValue([{ id: 1, name: 'Gala' }]);

    const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const { rerender, result, unmount } = renderHook(() => useFieldWorkDataReadiness(), { wrapper });

    await waitFor(() =>
      expect(result.current).toEqual({
        annotation: 'unavailable',
        inspection: 'unavailable',
        spraying: 'unavailable',
      }),
    );
    expect(mockedFieldWorkOptionsService.getZones).not.toHaveBeenCalled();

    mockedNetwork.useNetworkState.mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
    });
    rerender(undefined);

    await waitFor(() => expect(mockedFieldWorkOptionsService.getZones).toHaveBeenCalledTimes(1));
    expect(mockedFieldWorkOptionsService.getOccurrenceTypes).toHaveBeenCalledTimes(1);
    expect(mockedFieldWorkOptionsService.getVarieties).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(result.current).toEqual({ annotation: 'ready', inspection: 'ready', spraying: 'ready' }),
    );

    unmount();
    queryClient.clear();
  });

  it('restores persisted options after a restart and keeps cards ready offline', async () => {
    mockedNetwork.useNetworkState.mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
    });

    await fieldWorkOptionsCache.saveZones([{ id: 'zone-1', name: 'Talhao 1' }]);
    await fieldWorkOptionsCache.saveOccurrenceTypes([{ code: 'PST', id: 'occurrence-1', name: 'Praga' }]);
    await fieldWorkOptionsCache.saveVarieties([{ id: 1, name: 'Gala' }]);

    const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const { result, unmount } = renderHook(() => useFieldWorkDataReadiness(), { wrapper });

    expect(result.current).toEqual({ annotation: 'loading', inspection: 'loading', spraying: 'loading' });
    await waitFor(() =>
      expect(result.current).toEqual({ annotation: 'ready', inspection: 'ready', spraying: 'ready' }),
    );
    expect(mockedFieldWorkOptionsService.getZones).not.toHaveBeenCalled();
    expect(mockedFieldWorkOptionsService.getOccurrenceTypes).not.toHaveBeenCalled();
    expect(mockedFieldWorkOptionsService.getVarieties).not.toHaveBeenCalled();

    unmount();
    queryClient.clear();
  });

  it('persists successful online option loads for the next app process', async () => {
    mockedNetwork.useNetworkState.mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
    });
    mockedFieldWorkOptionsService.getZones.mockResolvedValue([{ id: 'zone-1', name: 'Talhao 1' }]);
    mockedFieldWorkOptionsService.getOccurrenceTypes.mockResolvedValue([
      { code: 'PST', id: 'occurrence-1', name: 'Praga' },
    ]);
    mockedFieldWorkOptionsService.getVarieties.mockResolvedValue([{ id: 1, name: 'Gala' }]);

    const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const { result, unmount } = renderHook(() => useFieldWorkDataReadiness(), { wrapper });

    await waitFor(() =>
      expect(result.current).toEqual({ annotation: 'ready', inspection: 'ready', spraying: 'ready' }),
    );
    await expect(fieldWorkOptionsCache.readAll()).resolves.toEqual({
      occurrenceTypes: [{ code: 'PST', id: 'occurrence-1', name: 'Praga' }],
      varieties: [{ id: 1, name: 'Gala' }],
      zones: [{ id: 'zone-1', name: 'Talhao 1' }],
    });

    unmount();
    queryClient.clear();
  });

  it('keeps cached cards disabled when mount-time Supabase validation fails', async () => {
    mockedNetwork.useNetworkState.mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
    });
    mockedFieldWorkOptionsService.getZones.mockRejectedValue(new Error('network unavailable'));
    mockedFieldWorkOptionsService.getOccurrenceTypes.mockRejectedValue(new Error('network unavailable'));
    mockedFieldWorkOptionsService.getVarieties.mockRejectedValue(new Error('network unavailable'));

    const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
    queryClient.setQueryData(fieldWorkQueryOptions.zones.queryKey, [{ id: 'zone-1', name: 'Talhao 1' }]);
    queryClient.setQueryData(fieldWorkQueryOptions.occurrenceTypes.queryKey, [
      { code: 'PST', id: 'occurrence-1', name: 'Praga' },
    ]);
    queryClient.setQueryData(fieldWorkQueryOptions.varieties.queryKey, [{ id: 1, name: 'Gala' }]);
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    const { result, unmount } = renderHook(() => useFieldWorkDataReadiness(), { wrapper });

    expect(result.current).toEqual({ annotation: 'loading', inspection: 'loading', spraying: 'loading' });
    await waitFor(() =>
      expect(result.current).toEqual({
        annotation: 'unavailable',
        inspection: 'unavailable',
        spraying: 'unavailable',
      }),
    );
    expect(mockedFieldWorkOptionsService.getZones).toHaveBeenCalledTimes(1);
    expect(mockedFieldWorkOptionsService.getOccurrenceTypes).toHaveBeenCalledTimes(1);
    expect(mockedFieldWorkOptionsService.getVarieties).toHaveBeenCalledTimes(1);

    unmount();
    queryClient.clear();
  });
});
