import { QueryClient } from '@tanstack/react-query';
import {
  fieldWorkQueryOptions,
  getAnnotationOptionsSnapshot,
  getInspectionFilterOptionsSnapshot,
  getSprayingZonesSnapshot,
  resolveFieldWorkCardStates,
  retryUnavailableFieldWorkQueries,
} from './use-field-work-data';

jest.mock('expo-router', () => ({ useFocusEffect: jest.fn() }));

const readyResources = {
  occurrenceTypes: 'ready',
  varieties: 'ready',
  zones: 'ready',
} as const;

describe('field-work data readiness', () => {
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
  });

  it('prioritizes loading until required resources resolve and disables every card offline', () => {
    expect(resolveFieldWorkCardStates({ ...readyResources, zones: 'loading' }, 'online')).toEqual({
      annotation: 'loading',
      inspection: 'loading',
      spraying: 'loading',
    });
    expect(resolveFieldWorkCardStates(readyResources, 'offline')).toEqual({
      annotation: 'unavailable',
      inspection: 'unavailable',
      spraying: 'unavailable',
    });
  });

  it('builds route snapshots exclusively from the shared cache', () => {
    const queryClient = new QueryClient();
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
    const queryClient = new QueryClient();
    const refetch = jest.spyOn(queryClient, 'refetchQueries').mockResolvedValue(undefined);
    queryClient.setQueryData(fieldWorkQueryOptions.zones.queryKey, [{ id: 'zone-1' }]);
    queryClient.setQueryData(fieldWorkQueryOptions.occurrenceTypes.queryKey, []);
    queryClient.setQueryData(fieldWorkQueryOptions.varieties.queryKey, [{ id: 1 }]);

    await retryUnavailableFieldWorkQueries(queryClient);

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(refetch).toHaveBeenCalledWith({
      exact: true,
      queryKey: fieldWorkQueryOptions.occurrenceTypes.queryKey,
      type: 'active',
    });
  });
});
