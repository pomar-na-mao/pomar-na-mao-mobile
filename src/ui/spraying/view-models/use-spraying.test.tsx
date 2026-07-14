import type { SprayingRepository } from '@/data/repositories/spraying/spraying-repository';
import type { SprayingSqliteService } from '@/data/services/spraying/spraying-sqlite-service';
import type { SprayingZoneOption } from '@/domain/models/spraying';
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
    getRecoverableOperation: jest.fn().mockResolvedValue(null),
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

  return (
    <View>
      <Text>aggregate:{spraying.aggregate?.operation.id ?? 'none'}</Text>
      <Text>zone:{spraying.selectedZone?.name ?? 'none'}</Text>
      <Text>plants:{spraying.selectedZonePlants.length}</Text>
      <Text>zones:{spraying.zones.length}</Text>
      <Pressable testID="load-zone-2" onPress={() => void spraying.loadZone('zone-2')}>
        <Text>load zone 2</Text>
      </Pressable>
      <Pressable testID="delete-local-state" onPress={() => void spraying.deleteActiveOperation()}>
        <Text>delete</Text>
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
  await waitFor(() => expect(repository.local.getRecoverableOperation).toHaveBeenCalled());
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

  it('clears a persisted loaded zone when its cached plant list is empty', async () => {
    mockGetLoadedSprayingZone.mockResolvedValue(sprayingZones[0]);
    await renderProvider();

    await waitFor(() => expect(mockClearLoadedSprayingZone).toHaveBeenCalled());
    expect(screen.getByText('zone:none')).toBeOnTheScreen();
    expect(screen.getByText('plants:0')).toBeOnTheScreen();
  });

  it('keeps a recoverable operation authoritative over persisted idle zone state', async () => {
    mockGetLoadedSprayingZone.mockResolvedValue(sprayingZones[1]);
    await renderProvider(
      createMockRepository({
        localOverrides: {
          getAggregate: jest.fn().mockResolvedValue(sprayingAggregateFixture),
          getRecoverableOperation: jest.fn().mockResolvedValue(sprayingOperationFixture),
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
});
