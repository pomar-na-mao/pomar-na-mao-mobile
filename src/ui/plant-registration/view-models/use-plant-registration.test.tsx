import type { LocalPlantRegistration } from '@/domain/models/plant-registration';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Pressable, Text } from 'react-native';
import { PlantRegistrationProvider, usePlantRegistration } from './use-plant-registration';

const mockRepository = {
  create: jest.fn(),
  deleteAllLocal: jest.fn(),
  deleteLocal: jest.fn(),
  list: jest.fn(),
  recoverInterruptedSyncs: jest.fn(),
  sync: jest.fn(),
};
const mockRequestPermission = jest.fn();
const mockGetPosition = jest.fn();
const mockWatchPosition = jest.fn();
const mockRemoveLocationSubscription = jest.fn();
let watchLocationCallback: ((location: unknown) => void) | null = null;

jest.mock('@/data/repositories/plant-registration/plant-registration-repository', () => ({
  createPlantRegistrationRepository: () => mockRepository,
}));
jest.mock('@/ui/shared/hooks/use-field-work-data', () => ({
  getPlantRegistrationOptionsSnapshot: () => ({
    varieties: [{ id: 7, name: 'Gala' }],
    zones: [{ id: 'zone-1', name: 'Norte' }],
  }),
}));
jest.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({}) }));
jest.mock('expo-sqlite', () => ({ useSQLiteContext: () => ({}) }));
jest.mock('expo-location', () => ({
  Accuracy: { BestForNavigation: 6, High: 4 },
  PermissionStatus: { GRANTED: 'granted' },
  getCurrentPositionAsync: (...args: unknown[]) => mockGetPosition(...args),
  requestForegroundPermissionsAsync: (...args: unknown[]) => mockRequestPermission(...args),
  watchPositionAsync: (...args: unknown[]) => mockWatchPosition(...args),
}));

const plant: LocalPlantRegistration = {
  id: 'local-1',
  local_id: 'local-1',
  latitude: -23.5,
  longitude: -46.6,
  variety_id: 7,
  variety_name: 'Gala',
  zone_id: 'zone-1',
  zone_name: 'Norte',
  planting_date: '2026-08-01T00:00:00.000Z',
  is_dead: 0,
  is_new: 1,
  non_existent: 0,
  created_at: '2026-08-12T12:00:00.000Z',
  updated_at: '2026-08-12T12:00:00.000Z',
  sync_status: 'pending_create',
  device_id: 'device-1',
  record_origin: 'local_registration',
};

function Harness() {
  const context = usePlantRegistration();
  return (
    <>
      <Text testID="location-state">{context.locationState}</Text>
      <Text testID="location-error">{context.locationError ?? ''}</Text>
      <Text testID="plant-count">{context.plants.length}</Text>
      <Text testID="syncing-all">{String(context.isSyncingAll)}</Text>
      <Pressable accessibilityRole="button" onPress={context.openModal}>
        <Text>Open</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={context.retryLocation}>
        <Text>Retry</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          void context.savePlant({ plantingDate: '2026-08-01T00:00:00.000Z', varietyId: 7, zoneId: 'zone-1' })
        }
      >
        <Text>Save</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => void context.deletePlant('local-1')}>
        <Text>Delete</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => void context.syncPlant('local-1')}>
        <Text>Sync</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => void context.deleteAllPlants()}>
        <Text>Delete all</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => void context.syncAllPlants()}>
        <Text>Sync all</Text>
      </Pressable>
    </>
  );
}

describe('PlantRegistrationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository.list.mockResolvedValue([]);
    mockRepository.recoverInterruptedSyncs.mockResolvedValue(undefined);
    mockRepository.create.mockResolvedValue(plant);
    mockRepository.deleteAllLocal.mockResolvedValue(1);
    mockRepository.deleteLocal.mockResolvedValue(true);
    mockRepository.sync.mockResolvedValue(undefined);
    watchLocationCallback = null;
    mockRequestPermission.mockResolvedValue({
      android: { accuracy: 'fine' },
      granted: true,
      status: 'granted',
    });
    mockWatchPosition.mockImplementation((_options, callback) => {
      watchLocationCallback = callback;
      return Promise.resolve({ remove: mockRemoveLocationSubscription });
    });
    mockGetPosition.mockImplementation(async () => ({
      coords: { accuracy: 3, latitude: -23.5, longitude: -46.6 },
      timestamp: Date.now(),
    }));
  });

  it('waits for a recent GPS fix within the accepted accuracy threshold', async () => {
    mockGetPosition.mockImplementationOnce(async () => ({
      coords: { accuracy: 12, latitude: -23.5, longitude: -46.6 },
      timestamp: Date.now(),
    }));
    render(
      <PlantRegistrationProvider>
        <Harness />
      </PlantRegistrationProvider>,
    );

    fireEvent.press(screen.getByText('Open'));
    await waitFor(() => expect(mockGetPosition).toHaveBeenCalled());
    expect(screen.getByTestId('location-state')).toHaveTextContent('loading');

    act(() => {
      watchLocationCallback?.({
        coords: { accuracy: 4, latitude: -23.5001, longitude: -46.6001 },
        timestamp: Date.now(),
      });
    });

    await waitFor(() => expect(screen.getByTestId('location-state')).toHaveTextContent('ready'));
  });

  it('acquires GPS and saves a valid plant locally before refreshing the list', async () => {
    mockRepository.list.mockResolvedValueOnce([]).mockResolvedValueOnce([plant]);
    render(
      <PlantRegistrationProvider>
        <Harness />
      </PlantRegistrationProvider>,
    );
    await waitFor(() => expect(mockRepository.recoverInterruptedSyncs).toHaveBeenCalled());

    fireEvent.press(screen.getByText('Open'));
    await waitFor(() => expect(screen.getByTestId('location-state')).toHaveTextContent('ready'));
    fireEvent.press(screen.getByText('Save'));

    await waitFor(() =>
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: -23.5,
          longitude: -46.6,
          gpsAccuracyM: 3,
          gpsTimestamp: expect.any(Number),
          varietyId: 7,
          varietyName: 'Gala',
          zoneId: 'zone-1',
          zoneName: 'Norte',
        }),
      ),
    );
    await waitFor(() => expect(screen.getByTestId('plant-count')).toHaveTextContent('1'));
  });

  it('shows permission denial and retries location acquisition', async () => {
    mockRequestPermission
      .mockResolvedValueOnce({ granted: false, status: 'denied' })
      .mockResolvedValueOnce({ android: { accuracy: 'fine' }, granted: true, status: 'granted' });
    render(
      <PlantRegistrationProvider>
        <Harness />
      </PlantRegistrationProvider>,
    );

    fireEvent.press(screen.getByText('Open'));
    await waitFor(() => expect(screen.getByTestId('location-state')).toHaveTextContent('error'));
    expect(screen.getByTestId('location-error')).not.toHaveTextContent('');

    fireEvent.press(screen.getByText('Retry'));
    await waitFor(() => expect(screen.getByTestId('location-state')).toHaveTextContent('ready'));
    expect(mockRequestPermission).toHaveBeenCalledTimes(2);
  });

  it('delegates local-only deletion and sync then refreshes the list', async () => {
    render(
      <PlantRegistrationProvider>
        <Harness />
      </PlantRegistrationProvider>,
    );
    await waitFor(() => expect(mockRepository.list).toHaveBeenCalled());

    fireEvent.press(screen.getByText('Delete'));
    await waitFor(() => expect(mockRepository.deleteLocal).toHaveBeenCalledWith('local-1'));
    expect(mockRepository.sync).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('Sync'));
    await waitFor(() => expect(mockRepository.sync).toHaveBeenCalledWith('local-1'));
  });

  it('deletes the full local list and synchronizes every pending or failed plant', async () => {
    const failedPlant: LocalPlantRegistration = {
      ...plant,
      id: 'local-2',
      local_id: 'local-2',
      sync_status: 'error',
    };
    const syncedPlant: LocalPlantRegistration = {
      ...plant,
      id: 'local-3',
      local_id: 'local-3',
      sync_status: 'synced',
    };
    mockRepository.list.mockResolvedValue([plant, failedPlant, syncedPlant]);
    render(
      <PlantRegistrationProvider>
        <Harness />
      </PlantRegistrationProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('plant-count')).toHaveTextContent('3'));

    fireEvent.press(screen.getByText('Sync all'));
    await waitFor(() => expect(mockRepository.sync).toHaveBeenCalledTimes(2));
    expect(mockRepository.sync).toHaveBeenNthCalledWith(1, 'local-1');
    expect(mockRepository.sync).toHaveBeenNthCalledWith(2, 'local-2');
    expect(mockRepository.sync).not.toHaveBeenCalledWith('local-3');
    await waitFor(() => expect(screen.getByTestId('syncing-all')).toHaveTextContent('false'));

    fireEvent.press(screen.getByText('Delete all'));
    await waitFor(() => expect(mockRepository.deleteAllLocal).toHaveBeenCalledTimes(1));
  });
});
