import type { SprayingRepository } from '@/data/repositories/spraying/spraying-repository';
import type { SprayingSqliteService } from '@/data/services/spraying/spraying-sqlite-service';
import type { SprayingSetup, SprayingZoneOption, SyncReviewedSprayingPayload } from '@/domain/models/spraying';
import { sprayingAggregateFixture, sprayingOperationFixture, sprayingPlantsFixture } from '@/test/spraying/fixtures';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SprayingProvider, useSpraying } from './use-spraying';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fieldWorkQueryOptions } from '@/ui/shared/hooks/use-field-work-data';

type MockSprayingRepository = Omit<jest.Mocked<SprayingRepository>, 'local'> & {
  local: jest.Mocked<SprayingSqliteService>;
};

const mockSetMessage = jest.fn();
const mockSetIsVisible = jest.fn();
const mockSetIsLoading = jest.fn();
const mockCreateSprayingRepository = jest.fn();
const mockGetLoadedSprayingZone = jest.fn();
const mockSaveLoadedSprayingZone = jest.fn();
const mockClearLoadedSprayingZone = jest.fn();
const mockReconcileSprayingLocationUpdates = jest.fn();
const mockStartSprayingLocationUpdates = jest.fn();
const mockStopSprayingLocationUpdates = jest.fn();

let mockSprayingRepository: MockSprayingRepository;

jest.mock('expo-router', () => ({ useFocusEffect: jest.fn() }));

const sprayingZones: SprayingZoneOption[] = [
  { id: 'zone-1', name: 'Talhao 1' },
  { id: 'zone-2', name: 'Talhao 2' },
];

const zone2Plants = sprayingPlantsFixture.map((plant) => ({
  ...plant,
  plantId: 'plant-zone-2',
  zoneId: 'zone-2',
  zoneName: 'Talhao 2',
}));

jest.mock('@/data/repositories/spraying/spraying-repository', () => ({
  createSprayingRepository: () => mockCreateSprayingRepository(),
}));

jest.mock('@/data/services/spraying/spraying-loaded-zone-service', () => ({
  clearLoadedSprayingZone: () => mockClearLoadedSprayingZone(),
  getLoadedSprayingZone: () => mockGetLoadedSprayingZone(),
  saveLoadedSprayingZone: (zone: SprayingZoneOption) => mockSaveLoadedSprayingZone(zone),
}));

jest.mock('@/data/services/spraying/spraying-location-service', () => ({
  reconcileSprayingLocationUpdates: (operationId?: string | null) => mockReconcileSprayingLocationUpdates(operationId),
  startSprayingLocationUpdates: (operationId: string, deviceId: string) =>
    mockStartSprayingLocationUpdates(operationId, deviceId),
  stopSprayingLocationUpdates: () => mockStopSprayingLocationUpdates(),
}));

jest.mock('@/shared/hooks/use-alert-box', () => ({
  useAlertBoxStore: () => ({
    setIsVisible: mockSetIsVisible,
    setMessage: mockSetMessage,
  }),
}));

jest.mock('@/shared/hooks/use-loading', () => ({
  useLoadingStore: () => ({
    setIsLoading: mockSetIsLoading,
  }),
}));

jest.mock('@/ui/spraying/helpers/device', () => ({
  getSprayingDeviceId: () => 'device-1',
}));

jest.mock('expo-location', () => ({
  Accuracy: {
    BestForNavigation: 6,
  },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}));

jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => ({}),
}));

const mockedLocation = jest.mocked(Location);

function createMockLocalService(
  overrides: Partial<jest.Mocked<SprayingSqliteService>> = {},
): jest.Mocked<SprayingSqliteService> {
  const local = {
    appendTrackPoint: jest.fn(),
    buildSyncPayload: jest.fn(),
    cacheZonePlants: jest.fn().mockResolvedValue(undefined),
    confirmAllAutomaticCandidates: jest.fn(),
    createOperation: jest.fn(),
    deleteOperation: jest.fn().mockResolvedValue(undefined),
    finishTracking: jest.fn(),
    getAggregate: jest.fn().mockResolvedValue(null),
    getLastTrackPoint: jest.fn(),
    listLoadedZones: jest
      .fn()
      .mockResolvedValue(sprayingZones.map((zone) => ({ ...zone, loadedAt: '2026-07-01', plantCount: 1 }))),
    getOperation: jest.fn(),
    getInProgressOperation: jest.fn().mockResolvedValue(null),
    listOperations: jest.fn().mockResolvedValue([]),
    getZonePlants: jest.fn().mockResolvedValue([]),
    getZones: jest.fn().mockResolvedValue(sprayingZones),
    listTrackPoints: jest.fn(),
    markReviewed: jest.fn(),
    markSyncError: jest.fn(),
    markSynced: jest.fn(),
    markSyncing: jest.fn(),
    markTracking: jest.fn(),
    replaceInputs: jest.fn(),
    resetTrackPointsForSimulation: jest.fn(),
    saveConsolidatedRoute: jest.fn(),
    saveSimulation: jest.fn(),
    setPlantConfirmed: jest.fn(),
    ...overrides,
  } as unknown as jest.Mocked<SprayingSqliteService>;

  return local;
}

function createMockRepository({
  localOverrides,
  repositoryOverrides,
}: {
  localOverrides?: Partial<jest.Mocked<SprayingSqliteService>>;
  repositoryOverrides?: Partial<jest.Mocked<SprayingRepository>>;
} = {}): MockSprayingRepository {
  const local = createMockLocalService(localOverrides);
  const repository = {
    local,
    getZones: jest.fn().mockResolvedValue({ data: sprayingZones, error: null }),
    getZonePlants: jest.fn().mockResolvedValue({ data: sprayingPlantsFixture, error: null }),
    syncReviewedOperation: jest.fn(),
    ...repositoryOverrides,
  } as unknown as MockSprayingRepository;

  mockSprayingRepository = repository;
  mockCreateSprayingRepository.mockReturnValue(repository);
  return repository;
}

function SprayingConsumer() {
  const spraying = useSpraying();
  const setup: SprayingSetup = {
    inputs: [{ inputType: 'insecticide', productName: 'Produto X' }],
    machineName: 'Pulverizador',
    maxDistanceMeters: 9,
    minDistanceMeters: 3.5,
    operatorName: 'Operador',
    zoneId: 'zone-1',
    zoneName: 'Talhao 1',
  };

  return (
    <View>
      <Text>location:{spraying.currentLocation?.timestamp ?? 'none'}</Text>
      <Text>aggregate:{spraying.aggregate?.operation.id ?? 'none'}</Text>
      <Text>view:{spraying.activeView}</Text>
      <Text>tracking:{spraying.trackingState}</Text>
      <Text>zone-selection:{spraying.isZoneSelectionVisible ? 'visible' : 'hidden'}</Text>
      <Text>setup:{spraying.isSetupVisible ? 'visible' : 'hidden'}</Text>
      <Text>zone:{spraying.selectedZone?.name ?? 'none'}</Text>
      <Text>plants:{spraying.selectedZonePlants.length}</Text>
      <Text>zones:{spraying.zones.length}</Text>
      <Pressable testID="load-zone-2" onPress={() => void spraying.loadZone('zone-2')}>
        <Text>load zone 2</Text>
      </Pressable>
      <Pressable testID="delete-local-state" onPress={() => void spraying.deleteActiveOperation()}>
        <Text>delete</Text>
      </Pressable>
      <Pressable testID="open-new-operation" onPress={() => void spraying.openMapView()}>
        <Text>open new</Text>
      </Pressable>
      <Pressable testID="open-setup" onPress={spraying.openSetup}>
        <Text>open setup</Text>
      </Pressable>
      <Pressable testID="close-zone-selection" onPress={spraying.closeZoneSelection}>
        <Text>close zone selection</Text>
      </Pressable>
      <Pressable testID="begin-operation" onPress={() => void spraying.beginOperation(setup)}>
        <Text>begin</Text>
      </Pressable>
      <Pressable testID="finish-operation" onPress={() => void spraying.finishTracking()}>
        <Text>finish</Text>
      </Pressable>
      <Pressable testID="sync-old-operation" onPress={() => void spraying.syncOperationById('operation-old')}>
        <Text>sync old</Text>
      </Pressable>
      <Pressable testID="delete-old-operation" onPress={() => void spraying.deleteOperationById('operation-old')}>
        <Text>delete old</Text>
      </Pressable>
    </View>
  );
}

async function renderProvider(repository = createMockRepository()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
  queryClient.setQueryData(fieldWorkQueryOptions.zones.queryKey, sprayingZones);
  render(
    <QueryClientProvider client={queryClient}>
      <SprayingProvider>
        <SprayingConsumer />
      </SprayingProvider>
    </QueryClientProvider>,
  );
  await waitFor(() => expect(repository.local.getInProgressOperation).toHaveBeenCalled());
  return repository;
}

describe('SprayingProvider loaded zone persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLoadedSprayingZone.mockResolvedValue(null);
    mockSaveLoadedSprayingZone.mockResolvedValue(undefined);
    mockClearLoadedSprayingZone.mockResolvedValue(undefined);
    mockReconcileSprayingLocationUpdates.mockResolvedValue('inactive');
    mockStartSprayingLocationUpdates.mockResolvedValue(true);
    mockStopSprayingLocationUpdates.mockResolvedValue(undefined);
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied',
    } as Location.PermissionResponse);
    mockedLocation.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: -23,
        longitude: -49,
        speed: null,
      },
      timestamp: 1,
    });
    mockedLocation.watchPositionAsync.mockResolvedValue({
      remove: jest.fn(),
    } as unknown as Location.LocationSubscription);
  });

  it('restores the persisted loaded zone from cached SQLite plants on startup', async () => {
    mockGetLoadedSprayingZone.mockResolvedValue(sprayingZones[0]);
    await renderProvider(
      createMockRepository({
        localOverrides: {
          getZonePlants: jest.fn().mockResolvedValue(sprayingPlantsFixture),
        },
      }),
    );

    await waitFor(() => expect(screen.getByText('zone:Talhao 1')).toBeOnTheScreen());
    expect(screen.getByText('plants:1')).toBeOnTheScreen();
    expect(screen.getByText('zones:2')).toBeOnTheScreen();
    expect(mockSprayingRepository.local.getZonePlants).toHaveBeenCalledWith('zone-1');
    expect(mockSprayingRepository.getZones).not.toHaveBeenCalled();
    expect(mockSprayingRepository.local.getZones).not.toHaveBeenCalled();
  });

  it('waits for a foreground location within the high-accuracy threshold', async () => {
    const acceptedTimestamp = Date.now();
    let locationCallback: ((location: Location.LocationObject) => void) | null = null;
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      android: { accuracy: 'fine' },
      granted: true,
      status: 'granted',
    } as Location.LocationPermissionResponse);
    mockedLocation.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        accuracy: 12,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: -23,
        longitude: -49,
        speed: null,
      },
      timestamp: acceptedTimestamp,
    });
    mockedLocation.watchPositionAsync.mockImplementation(async (_options, callback) => {
      locationCallback = callback;
      return { remove: jest.fn() } as Location.LocationSubscription;
    });

    await renderProvider();
    await waitFor(() => expect(mockedLocation.watchPositionAsync).toHaveBeenCalled());
    expect(screen.getByText('location:none')).toBeOnTheScreen();

    act(() => {
      locationCallback?.({
        coords: {
          accuracy: 4,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          latitude: -23,
          longitude: -49,
          speed: null,
        },
        timestamp: acceptedTimestamp,
      });
    });

    await waitFor(() => expect(screen.getByText(`location:${acceptedTimestamp}`)).toBeOnTheScreen());
  });

  it('clears a persisted loaded zone when its cached plant list is empty', async () => {
    mockGetLoadedSprayingZone.mockResolvedValue(sprayingZones[0]);
    await renderProvider();

    await waitFor(() => expect(mockClearLoadedSprayingZone).toHaveBeenCalled());
    expect(screen.getByText('zone:none')).toBeOnTheScreen();
    expect(screen.getByText('plants:0')).toBeOnTheScreen();
  });

  it('keeps an in-progress operation authoritative over persisted idle zone state', async () => {
    mockGetLoadedSprayingZone.mockResolvedValue(sprayingZones[1]);
    await renderProvider(
      createMockRepository({
        localOverrides: {
          getAggregate: jest.fn().mockResolvedValue(sprayingAggregateFixture),
          getInProgressOperation: jest.fn().mockResolvedValue(sprayingOperationFixture),
        },
      }),
    );

    await waitFor(() => expect(screen.getByText('aggregate:operation-1')).toBeOnTheScreen());
    expect(screen.getByText('zone:Talhao 1')).toBeOnTheScreen();
    expect(mockGetLoadedSprayingZone).not.toHaveBeenCalled();
  });

  it('replaces the persisted loaded zone when another zone is loaded', async () => {
    await renderProvider(
      createMockRepository({
        localOverrides: {
          getZonePlants: jest.fn().mockImplementation(async (zoneId) => (zoneId === 'zone-2' ? zone2Plants : [])),
        },
      }),
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId('load-zone-2'));
    });

    await waitFor(() => expect(mockSaveLoadedSprayingZone).toHaveBeenCalledWith(sprayingZones[1]));
    expect(mockSprayingRepository.local.getZonePlants).toHaveBeenCalledWith('zone-2');
    expect(mockSprayingRepository.getZonePlants).not.toHaveBeenCalled();
    expect(mockSprayingRepository.local.cacheZonePlants).not.toHaveBeenCalled();
    expect(screen.getByText('zone:Talhao 2')).toBeOnTheScreen();
    expect(screen.getByText('plants:1')).toBeOnTheScreen();
    expect(screen.getByText('setup:hidden')).toBeOnTheScreen();
  });

  it('allows choosing another loaded zone before opening setup for the next operation', async () => {
    mockGetLoadedSprayingZone.mockResolvedValue(sprayingZones[0]);
    await renderProvider(
      createMockRepository({
        localOverrides: {
          getZonePlants: jest
            .fn()
            .mockImplementation(async (zoneId) => (zoneId === 'zone-2' ? zone2Plants : sprayingPlantsFixture)),
        },
      }),
    );
    await waitFor(() => expect(screen.getByText('zone:Talhao 1')).toBeOnTheScreen());

    fireEvent.press(screen.getByTestId('open-setup'));
    expect(screen.getByText('zone-selection:visible')).toBeOnTheScreen();
    expect(screen.getByText('setup:hidden')).toBeOnTheScreen();

    await act(async () => {
      fireEvent.press(screen.getByTestId('load-zone-2'));
    });

    await waitFor(() => expect(screen.getByText('zone:Talhao 2')).toBeOnTheScreen());
    expect(screen.getByText('zone-selection:hidden')).toBeOnTheScreen();
    expect(screen.getByText('setup:visible')).toBeOnTheScreen();
    expect(mockSaveLoadedSprayingZone).toHaveBeenLastCalledWith(sprayingZones[1]);
  });

  it('cancels zone confirmation without opening setup or changing the restored zone', async () => {
    mockGetLoadedSprayingZone.mockResolvedValue(sprayingZones[0]);
    await renderProvider(
      createMockRepository({
        localOverrides: {
          getZonePlants: jest.fn().mockResolvedValue(sprayingPlantsFixture),
        },
      }),
    );
    await waitFor(() => expect(screen.getByText('zone:Talhao 1')).toBeOnTheScreen());

    fireEvent.press(screen.getByTestId('open-setup'));
    fireEvent.press(screen.getByTestId('close-zone-selection'));

    expect(screen.getByText('zone-selection:hidden')).toBeOnTheScreen();
    expect(screen.getByText('setup:hidden')).toBeOnTheScreen();
    expect(screen.getByText('zone:Talhao 1')).toBeOnTheScreen();
  });

  it('clears persisted and in-memory loaded plants when deleting idle loaded state', async () => {
    mockGetLoadedSprayingZone.mockResolvedValue(sprayingZones[0]);
    await renderProvider(
      createMockRepository({
        localOverrides: {
          getZonePlants: jest.fn().mockResolvedValue(sprayingPlantsFixture),
        },
      }),
    );
    await waitFor(() => expect(screen.getByText('plants:1')).toBeOnTheScreen());

    await act(async () => {
      fireEvent.press(screen.getByTestId('delete-local-state'));
    });

    await waitFor(() => expect(mockClearLoadedSprayingZone).toHaveBeenCalled());
    expect(mockSprayingRepository.local.deleteOperation).not.toHaveBeenCalled();
    expect(screen.getByText('zone:none')).toBeOnTheScreen();
    expect(screen.getByText('plants:0')).toBeOnTheScreen();
  });

  it('keeps completed pending operations in the list without restoring one as the active cycle', async () => {
    const finishedOperation = {
      ...sprayingOperationFixture,
      lifecycle_status: 'finished' as const,
      finished_at: '2026-06-07T13:00:00.000Z',
    };
    mockGetLoadedSprayingZone.mockResolvedValue(sprayingZones[0]);
    const repository = await renderProvider(
      createMockRepository({
        localOverrides: {
          getInProgressOperation: jest.fn().mockResolvedValue(null),
          getZonePlants: jest.fn().mockResolvedValue(sprayingPlantsFixture),
          listOperations: jest.fn().mockResolvedValue([finishedOperation]),
        },
      }),
    );

    await waitFor(() => expect(screen.getByText('aggregate:none')).toBeOnTheScreen());
    expect(screen.getByText('zone:Talhao 1')).toBeOnTheScreen();
    expect(repository.local.listOperations).toHaveBeenCalled();
    expect(repository.local.getAggregate).not.toHaveBeenCalled();
  });

  it('reopens an existing in-progress operation from the new-operation entry point', async () => {
    const repository = await renderProvider(
      createMockRepository({
        localOverrides: {
          getAggregate: jest.fn().mockResolvedValue(sprayingAggregateFixture),
          getInProgressOperation: jest.fn().mockResolvedValue(sprayingOperationFixture),
        },
      }),
    );
    await waitFor(() => expect(screen.getByText('aggregate:operation-1')).toBeOnTheScreen());

    await act(async () => {
      fireEvent.press(screen.getByTestId('open-new-operation'));
    });

    await waitFor(() => expect(screen.getByText('view:map')).toBeOnTheScreen());
    expect(repository.local.getAggregate).toHaveBeenLastCalledWith('operation-1');
    expect(repository.local.createOperation).not.toHaveBeenCalled();
  });

  it('finishes one operation and starts another before synchronization', async () => {
    const trackingOperation = {
      ...sprayingOperationFixture,
      lifecycle_status: 'tracking' as const,
    };
    const finishedOperation = {
      ...trackingOperation,
      lifecycle_status: 'finished' as const,
      finished_at: '2026-06-07T13:00:00.000Z',
    };
    const secondOperation = {
      ...sprayingOperationFixture,
      id: 'operation-2',
      local_id: 'operation-2',
      lifecycle_status: 'draft' as const,
    };
    const trackingAggregate = {
      ...sprayingAggregateFixture,
      operation: trackingOperation,
    };
    const secondAggregate = {
      ...sprayingAggregateFixture,
      operation: { ...secondOperation, lifecycle_status: 'tracking' as const },
    };
    mockReconcileSprayingLocationUpdates.mockResolvedValue('active');
    const repository = await renderProvider(
      createMockRepository({
        localOverrides: {
          createOperation: jest.fn().mockResolvedValue(secondOperation),
          getAggregate: jest
            .fn()
            .mockImplementation(async (operationId) =>
              operationId === secondOperation.id ? secondAggregate : trackingAggregate,
            ),
          getInProgressOperation: jest.fn().mockResolvedValueOnce(trackingOperation).mockResolvedValue(null),
          getOperation: jest.fn().mockResolvedValue(finishedOperation),
          listOperations: jest.fn().mockResolvedValue([finishedOperation]),
          listTrackPoints: jest.fn().mockResolvedValue(sprayingAggregateFixture.trackPoints),
        },
      }),
    );
    await waitFor(() => expect(screen.getByText('aggregate:operation-1')).toBeOnTheScreen());

    await act(async () => {
      fireEvent.press(screen.getByTestId('finish-operation'));
    });
    await waitFor(() => expect(screen.getByText('aggregate:none')).toBeOnTheScreen());
    expect(screen.getByText('view:list')).toBeOnTheScreen();
    expect(screen.getByText('tracking:inactive')).toBeOnTheScreen();

    await act(async () => {
      fireEvent.press(screen.getByTestId('open-new-operation'));
    });
    await waitFor(() => expect(screen.getByText('view:map')).toBeOnTheScreen());

    await act(async () => {
      fireEvent.press(screen.getByTestId('begin-operation'));
    });
    await waitFor(() => expect(screen.getByText('aggregate:operation-2')).toBeOnTheScreen());

    expect(repository.local.finishTracking).toHaveBeenCalledWith('operation-1');
    expect(repository.local.createOperation).toHaveBeenCalledTimes(1);
    expect(mockStartSprayingLocationUpdates).toHaveBeenLastCalledWith('operation-2', 'device-1');
    expect(repository.local.markTracking).toHaveBeenCalledWith('operation-2');
  });

  it('synchronizes an older operation without disturbing a newer active cycle', async () => {
    const activeOperation = {
      ...sprayingOperationFixture,
      id: 'operation-new',
      local_id: 'operation-new',
      lifecycle_status: 'tracking' as const,
    };
    const oldOperation = {
      ...sprayingOperationFixture,
      id: 'operation-old',
      local_id: 'operation-old',
      lifecycle_status: 'reviewed' as const,
      review_status: 'reviewed',
      finished_at: '2026-06-07T13:00:00.000Z',
    };
    const activeAggregate = { ...sprayingAggregateFixture, operation: activeOperation };
    const oldAggregate = { ...sprayingAggregateFixture, operation: oldOperation };
    const payload = { localOperationId: oldOperation.id } as SyncReviewedSprayingPayload;
    mockReconcileSprayingLocationUpdates.mockResolvedValue('active');
    const repository = await renderProvider(
      createMockRepository({
        localOverrides: {
          buildSyncPayload: jest.fn().mockResolvedValue(payload),
          getAggregate: jest
            .fn()
            .mockImplementation(async (operationId) =>
              operationId === oldOperation.id ? oldAggregate : activeAggregate,
            ),
          getInProgressOperation: jest.fn().mockResolvedValue(activeOperation),
          listOperations: jest.fn().mockResolvedValue([activeOperation, oldOperation]),
        },
        repositoryOverrides: {
          syncReviewedOperation: jest.fn().mockResolvedValue({
            data: {
              confirmed_plants_count: 1,
              field_operation_id: 'remote-old',
              inputs_count: 1,
              route_id: 'remote-route-old',
              synced_at: '2026-06-07T14:00:00.000Z',
              track_points_count: 2,
            },
            error: null,
          }),
        },
      }),
    );
    await waitFor(() => expect(screen.getByText('aggregate:operation-new')).toBeOnTheScreen());

    await act(async () => {
      fireEvent.press(screen.getByTestId('sync-old-operation'));
    });

    await waitFor(() => expect(repository.local.markSynced).toHaveBeenCalledWith('operation-old', expect.any(Object)));
    expect(screen.getByText('aggregate:operation-new')).toBeOnTheScreen();
    expect(screen.getByText('tracking:active')).toBeOnTheScreen();
    expect(mockStopSprayingLocationUpdates).not.toHaveBeenCalled();
    expect(mockClearLoadedSprayingZone).not.toHaveBeenCalled();
  });

  it('deletes an older completed operation without disturbing a newer active cycle', async () => {
    const activeOperation = {
      ...sprayingOperationFixture,
      id: 'operation-new',
      local_id: 'operation-new',
      lifecycle_status: 'tracking' as const,
    };
    const oldOperation = {
      ...sprayingOperationFixture,
      id: 'operation-old',
      local_id: 'operation-old',
      lifecycle_status: 'finished' as const,
    };
    const activeAggregate = { ...sprayingAggregateFixture, operation: activeOperation };
    mockReconcileSprayingLocationUpdates.mockResolvedValue('active');
    const repository = await renderProvider(
      createMockRepository({
        localOverrides: {
          getAggregate: jest.fn().mockResolvedValue(activeAggregate),
          getInProgressOperation: jest.fn().mockResolvedValue(activeOperation),
          getOperation: jest.fn().mockResolvedValue(oldOperation),
          listOperations: jest.fn().mockResolvedValue([activeOperation, oldOperation]),
        },
      }),
    );
    await waitFor(() => expect(screen.getByText('aggregate:operation-new')).toBeOnTheScreen());

    await act(async () => {
      fireEvent.press(screen.getByTestId('delete-old-operation'));
    });

    await waitFor(() => expect(repository.local.deleteOperation).toHaveBeenCalledWith('operation-old'));
    expect(screen.getByText('aggregate:operation-new')).toBeOnTheScreen();
    expect(screen.getByText('tracking:active')).toBeOnTheScreen();
    expect(mockStopSprayingLocationUpdates).not.toHaveBeenCalled();
    expect(mockClearLoadedSprayingZone).not.toHaveBeenCalled();
  });
});
