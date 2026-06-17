import { annotationRepository } from '@/data/repositories/annotation/annotation-repository';
import { useAnnotationSqliteService } from '@/data/services/annotation/use-annotation-sqlite-service';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { annotationLocation, localAnnotationOccurrence, localAnnotationOperation } from '@/test/annotation/fixtures';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { AnnotationProvider, useAnnotation } from './use-annotation';

const mockSetMessage = jest.fn();
const mockSetIsVisible = jest.fn();
const mockSetIsLoading = jest.fn();

jest.mock('@/data/repositories/annotation/annotation-repository', () => ({
  annotationRepository: {
    getOptions: jest.fn(),
    syncAnnotation: jest.fn(),
  },
}));

jest.mock('@/data/services/annotation/use-annotation-sqlite-service', () => ({
  useAnnotationSqliteService: jest.fn(),
}));

jest.mock('@/shared/hooks/use-alert-box', () => ({
  useAlertBoxStore: jest.fn(),
}));

jest.mock('@/shared/hooks/use-loading', () => ({
  useLoadingStore: jest.fn(),
}));

jest.mock('@/ui/annotation/helpers/device', () => ({
  getAnnotationDeviceId: () => 'device-1',
}));

jest.mock('expo-location', () => ({
  Accuracy: {
    BestForNavigation: 6,
  },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}));

const mockedRepository = jest.mocked(annotationRepository);
const mockedUseAnnotationSqliteService = jest.mocked(useAnnotationSqliteService);
const mockedUseAlertBoxStore = jest.mocked(useAlertBoxStore);
const mockedUseLoadingStore = jest.mocked(useLoadingStore);
const mockedLocation = jest.mocked(Location);

const simulatedAnnotationLocation: Location.LocationObject = {
  ...annotationLocation,
  coords: {
    ...annotationLocation.coords,
    latitude: annotationLocation.coords.latitude + 0.0002,
    longitude: annotationLocation.coords.longitude + 0.0002,
  },
  timestamp: annotationLocation.timestamp + 100,
};

const latestDeviceAnnotationLocation: Location.LocationObject = {
  ...annotationLocation,
  coords: {
    ...annotationLocation.coords,
    latitude: annotationLocation.coords.latitude + 0.0004,
    longitude: annotationLocation.coords.longitude + 0.0004,
  },
  timestamp: annotationLocation.timestamp + 200,
};

function createSqliteService() {
  return {
    buildSyncPayload: jest.fn(),
    clearAnnotations: jest.fn().mockResolvedValue(undefined),
    createAnnotation: jest.fn().mockResolvedValue(localAnnotationOccurrence),
    finishActiveOperation: jest.fn().mockResolvedValue(undefined),
    getActiveOperation: jest.fn().mockResolvedValue(localAnnotationOperation),
    getCachedOptions: jest.fn().mockResolvedValue({ occurrenceTypes: [], zones: [] }),
    getPendingAnnotations: jest.fn().mockResolvedValue([]),
    getSummary: jest.fn().mockResolvedValue({ error: 0, pending: 0, synced: 0, total: 0 }),
    listAnnotations: jest.fn().mockResolvedValue([]),
    markAnnotationSynced: jest.fn(),
    markAnnotationSyncError: jest.fn(),
    markAnnotationSyncing: jest.fn(),
  };
}

function AnnotationConsumer() {
  const annotation = useAnnotation();

  return (
    <View>
      <Text>location:{annotation.currentLocation?.timestamp ?? 'none'}</Text>
      <Text>initial:{annotation.initialRegion ? 'ready' : 'none'}</Text>
      <Pressable testID="activate-simulation" onPress={() => annotation.setLocationSimulationActive(true)}>
        <Text>activate simulation</Text>
      </Pressable>
      <Pressable
        testID="simulation-location"
        onPress={() => annotation.applyLocationUpdate(simulatedAnnotationLocation, { source: 'simulation' })}
      >
        <Text>simulation location</Text>
      </Pressable>
      <Pressable
        testID="device-location"
        onPress={() => annotation.applyLocationUpdate(latestDeviceAnnotationLocation)}
      >
        <Text>device location</Text>
      </Pressable>
      <Pressable testID="deactivate-simulation" onPress={() => annotation.setLocationSimulationActive(false)}>
        <Text>deactivate simulation</Text>
      </Pressable>
    </View>
  );
}

async function renderProvider(service = createSqliteService()) {
  mockedUseAnnotationSqliteService.mockReturnValue(service as never);
  render(
    <AnnotationProvider>
      <AnnotationConsumer />
    </AnnotationProvider>,
  );

  await waitFor(() => expect(service.listAnnotations).toHaveBeenCalled());
  return service;
}

describe('AnnotationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAlertBoxStore.mockReturnValue({
      setIsVisible: mockSetIsVisible,
      setMessage: mockSetMessage,
    } as never);
    mockedUseLoadingStore.mockReturnValue({
      setIsLoading: mockSetIsLoading,
    } as never);
    mockedRepository.getOptions.mockResolvedValue({ data: { occurrenceTypes: [], zones: [] }, error: null });
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    } as Location.PermissionResponse);
    mockedLocation.getCurrentPositionAsync.mockResolvedValue(annotationLocation);
    mockedLocation.watchPositionAsync.mockResolvedValue({
      remove: jest.fn(),
    } as unknown as Location.LocationSubscription);
  });

  it('loads initial location on mount', async () => {
    await renderProvider();

    await waitFor(() => expect(screen.getByText(`location:${annotationLocation.timestamp}`)).toBeOnTheScreen());
    expect(screen.getByText('initial:ready')).toBeOnTheScreen();
    expect(mockedLocation.watchPositionAsync).toHaveBeenCalled();
  });

  it('keeps the simulated location effective and restores the latest device location when cleared', async () => {
    await renderProvider();

    await waitFor(() => expect(screen.getByText(`location:${annotationLocation.timestamp}`)).toBeOnTheScreen());

    await act(async () => {
      fireEvent.press(screen.getByTestId('activate-simulation'));
      fireEvent.press(screen.getByTestId('simulation-location'));
    });
    expect(screen.getByText(`location:${simulatedAnnotationLocation.timestamp}`)).toBeOnTheScreen();

    await act(async () => {
      fireEvent.press(screen.getByTestId('device-location'));
    });
    expect(screen.getByText(`location:${simulatedAnnotationLocation.timestamp}`)).toBeOnTheScreen();

    await act(async () => {
      fireEvent.press(screen.getByTestId('deactivate-simulation'));
    });
    await waitFor(() =>
      expect(screen.getByText(`location:${latestDeviceAnnotationLocation.timestamp}`)).toBeOnTheScreen(),
    );
  });
});
