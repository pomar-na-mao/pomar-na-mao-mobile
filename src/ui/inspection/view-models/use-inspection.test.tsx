import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { inspectionRepository } from '@/data/repositories/inspection/inspection-repository';
import { useInspectionSqliteService } from '@/data/services/inspection/use-inspection-sqlite-service';
import {
  createPostgrestError,
  inspectionFilter,
  inspectionFilterOptions,
  inspectionLocation,
  inspectionOccurrence,
  inspectionPlant,
  inspectionListItem,
  localInspection,
  localInspectionChange,
  secondInspectionPlant,
  syncManualInspectionResult,
} from '@/test/inspection/fixtures';
import { InspectionProvider, useInspection } from './use-inspection';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fieldWorkQueryOptions } from '@/ui/shared/hooks/use-field-work-data';

const mockSetMessage = jest.fn();
const mockSetIsVisible = jest.fn();
const mockSetIsLoading = jest.fn();

jest.mock('@/data/repositories/inspection/inspection-repository', () => ({
  inspectionRepository: {
    getFilterOptions: jest.fn(),
    getInspectionPlants: jest.fn(),
    syncManualInspection: jest.fn(),
  },
}));

jest.mock('@/data/services/inspection/use-inspection-sqlite-service', () => ({
  useInspectionSqliteService: jest.fn(),
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

jest.mock('@/ui/inspection/helpers/device', () => ({
  getInspectionDeviceId: () => 'device-1',
}));

jest.mock('expo-location', () => ({
  Accuracy: {
    BestForNavigation: 6,
  },
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}));

const mockedRepository = jest.mocked(inspectionRepository);
const mockedUseInspectionSqliteService = jest.mocked(useInspectionSqliteService);
const mockedLocation = jest.mocked(Location);
const simulatedInspectionLocation: Location.LocationObject = {
  ...inspectionLocation,
  coords: {
    ...inspectionLocation.coords,
    latitude: secondInspectionPlant.latitude,
    longitude: secondInspectionPlant.longitude,
  },
  timestamp: inspectionLocation.timestamp + 100,
};
const latestDeviceInspectionLocation: Location.LocationObject = {
  ...inspectionLocation,
  coords: {
    ...inspectionLocation.coords,
    latitude: inspectionPlant.latitude,
    longitude: inspectionPlant.longitude,
  },
  timestamp: inspectionLocation.timestamp + 200,
};

function createSqliteService(overrides: Partial<ReturnType<typeof useInspectionSqliteService>> = {}) {
  return {
    addInspectionChange: jest.fn().mockResolvedValue({}),
    buildSyncPayload: jest.fn().mockResolvedValue({ deviceId: 'device-1', plantsChanged: [] }),
    clearLoadedPlantsChangedState: jest.fn().mockResolvedValue(undefined),
    createInspection: jest.fn().mockResolvedValue(localInspection),
    finishInspection: jest.fn().mockResolvedValue(undefined),
    getCachedFilterOptions: jest.fn().mockResolvedValue(inspectionFilterOptions),
    getChanges: jest.fn().mockResolvedValue([]),
    getInspectionById: jest.fn().mockResolvedValue(localInspection),
    getLatestInspection: jest.fn().mockResolvedValue(null),
    getLatestPendingInspection: jest.fn().mockResolvedValue(null),
    getLoadedPlants: jest.fn().mockResolvedValue([inspectionPlant, secondInspectionPlant]),
    listInspections: jest.fn().mockResolvedValue([inspectionListItem]),
    markInspectionSynced: jest.fn().mockResolvedValue(undefined),
    markInspectionSyncError: jest.fn().mockResolvedValue(undefined),
    markInspectionSyncing: jest.fn().mockResolvedValue(undefined),
    updateNearestPlant: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function InspectionConsumer() {
  const inspection = useInspection();

  return (
    <View>
      <Text>active:{inspection.activeInspection?.id ?? 'none'}</Text>
      <Text>loaded:{inspection.loadedPlants.length}</Text>
      <Text>nearest:{inspection.nearestPlant?.plantId ?? 'none'}</Text>
      <Text>filters:{inspection.filterOptions.zones.length}</Text>
      <Text>inspections:{inspection.inspections.length}</Text>
      <Text>filter-modal:{String(inspection.isFilterModalVisible)}</Text>
      <Text>nearest-modal:{String(inspection.isNearestPlantModalVisible)}</Text>
      <Text>initial:{inspection.initialRegion ? 'ready' : 'none'}</Text>
      <Text>location:{inspection.currentLocation?.timestamp ?? 'none'}</Text>
      <Pressable testID="open-filter" onPress={inspection.openFilterModal}>
        <Text>open filter</Text>
      </Pressable>
      <Pressable testID="open-nearest" onPress={inspection.openNearestPlantModal}>
        <Text>open nearest</Text>
      </Pressable>
      <Pressable testID="apply-empty" onPress={() => void inspection.applyFilters({})}>
        <Text>apply empty</Text>
      </Pressable>
      <Pressable testID="apply-filter" onPress={() => void inspection.applyFilters(inspectionFilter)}>
        <Text>apply filter</Text>
      </Pressable>
      <Pressable testID="location" onPress={() => inspection.applyLocationUpdate(inspectionLocation)}>
        <Text>location</Text>
      </Pressable>
      <Pressable testID="activate-simulation" onPress={() => inspection.setLocationSimulationActive(true)}>
        <Text>activate simulation</Text>
      </Pressable>
      <Pressable
        testID="simulation-location"
        onPress={() => inspection.applyLocationUpdate(simulatedInspectionLocation, { source: 'simulation' })}
      >
        <Text>simulation location</Text>
      </Pressable>
      <Pressable
        testID="device-location"
        onPress={() => inspection.applyLocationUpdate(latestDeviceInspectionLocation)}
      >
        <Text>device location</Text>
      </Pressable>
      <Pressable testID="deactivate-simulation" onPress={() => inspection.setLocationSimulationActive(false)}>
        <Text>deactivate simulation</Text>
      </Pressable>
      <Pressable
        testID="save-change"
        onPress={() =>
          void inspection.saveOccurrenceChange({
            changeType: 'add_occurrence',
            notes: 'nota',
            occurrence: inspectionFilterOptions.occurrenceTypes[0],
            severity: 'alta',
          })
        }
      >
        <Text>save change</Text>
      </Pressable>
      <Pressable
        testID="save-add"
        onPress={() =>
          void inspection.saveOccurrenceChange({
            changeType: 'add_occurrence',
            notes: 'nova',
            occurrence: inspectionFilterOptions.occurrenceTypes[0],
            severity: 'media',
          })
        }
      >
        <Text>save add</Text>
      </Pressable>
      <Pressable
        testID="save-remove"
        onPress={() =>
          void inspection.saveOccurrenceChange({
            changeType: 'remove_occurrence',
            occurrence: inspectionFilterOptions.occurrenceTypes[0],
          })
        }
      >
        <Text>save remove</Text>
      </Pressable>
      <Pressable testID="finish" onPress={() => void inspection.finishActiveInspection()}>
        <Text>finish</Text>
      </Pressable>
      <Pressable testID="sync" onPress={() => void inspection.syncInspection(localInspection.id)}>
        <Text>sync</Text>
      </Pressable>
    </View>
  );
}

async function renderProvider(service = createSqliteService()) {
  mockedUseInspectionSqliteService.mockReturnValue(service);
  const queryClient = new QueryClient();
  queryClient.setQueryData(fieldWorkQueryOptions.zones.queryKey, inspectionFilterOptions.zones);
  queryClient.setQueryData(fieldWorkQueryOptions.occurrenceTypes.queryKey, inspectionFilterOptions.occurrenceTypes);
  queryClient.setQueryData(fieldWorkQueryOptions.varieties.queryKey, inspectionFilterOptions.varieties);
  render(
    <QueryClientProvider client={queryClient}>
      <InspectionProvider>
        <InspectionConsumer />
      </InspectionProvider>
    </QueryClientProvider>,
  );
  await waitFor(() => expect(service.listInspections).toHaveBeenCalled());
  return service;
}

describe('InspectionProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRepository.getFilterOptions.mockResolvedValue({ data: inspectionFilterOptions, error: null });
    mockedRepository.getInspectionPlants.mockResolvedValue({
      data: [inspectionPlant, secondInspectionPlant],
      error: null,
    });
    mockedRepository.syncManualInspection.mockResolvedValue({ data: syncManualInspectionResult, error: null });
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    } as Location.PermissionResponse);
    mockedLocation.getCurrentPositionAsync.mockResolvedValue(inspectionLocation);
    mockedLocation.watchPositionAsync.mockResolvedValue({
      remove: jest.fn(),
    } as unknown as Location.LocationSubscription);
  });

  it('loads filters, list state, pending inspection state, and initial location on mount', async () => {
    const service = await renderProvider(
      createSqliteService({
        getLatestPendingInspection: jest.fn().mockResolvedValue(localInspection),
      }),
    );

    await waitFor(() => expect(screen.getByText('active:inspection-1')).toBeOnTheScreen());
    expect(screen.getByText('loaded:2')).toBeOnTheScreen();
    expect(screen.getByText('nearest:plant-1')).toBeOnTheScreen();
    expect(screen.getByText('filters:1')).toBeOnTheScreen();
    expect(screen.getByText('initial:ready')).toBeOnTheScreen();
    expect(service.listInspections).toHaveBeenCalled();
    expect(service.getLoadedPlants).toHaveBeenCalledWith(localInspection.id);
    expect(mockedLocation.requestForegroundPermissionsAsync).toHaveBeenCalled();
    expect(mockedLocation.watchPositionAsync).toHaveBeenCalled();
    expect(mockedRepository.getFilterOptions).not.toHaveBeenCalled();
    expect(service.getCachedFilterOptions).not.toHaveBeenCalled();
  });

  it('restores latest inspection plants without making it active when there is no pending inspection', async () => {
    await renderProvider(
      createSqliteService({
        getLatestInspection: jest.fn().mockResolvedValue({ ...localInspection, status: 'finished' }),
        getLatestPendingInspection: jest.fn().mockResolvedValue(null),
      }),
    );

    await waitFor(() => expect(screen.getByText('active:none')).toBeOnTheScreen());
    expect(screen.getByText('loaded:2')).toBeOnTheScreen();
  });

  it('surfaces denied location permission without loading filters on route startup', async () => {
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied',
    } as Location.PermissionResponse);

    await renderProvider();

    await waitFor(() => expect(mockSetMessage).toHaveBeenCalledWith(expect.stringContaining('Permiss')));
    expect(mockSetMessage).toHaveBeenCalledWith(expect.stringContaining('Permiss'));
    expect(mockSetIsVisible).toHaveBeenCalledWith(true);
    expect(mockedRepository.getFilterOptions).not.toHaveBeenCalled();
  });

  it('validates filters and creates a local inspection from repository plants', async () => {
    const service = await renderProvider();

    await act(async () => {
      fireEvent.press(screen.getByTestId('apply-empty'));
    });
    expect(mockSetMessage).toHaveBeenCalledWith(expect.stringContaining('Selecione uma zona'));

    await act(async () => {
      fireEvent.press(screen.getByTestId('apply-filter'));
    });

    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    expect(mockedRepository.getInspectionPlants).toHaveBeenCalledWith(inspectionFilter);
    expect(service.createInspection).toHaveBeenCalledWith(inspectionFilter, [inspectionPlant, secondInspectionPlant]);
    expect(screen.getByText('active:inspection-1')).toBeOnTheScreen();
    expect(mockSetIsLoading).toHaveBeenLastCalledWith(false);
  });

  it('handles filter repository errors and empty plant responses', async () => {
    await renderProvider();

    mockedRepository.getInspectionPlants.mockResolvedValueOnce({
      data: null,
      error: createPostgrestError('rpc failed'),
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('apply-filter'));
    });
    expect(mockSetMessage).toHaveBeenCalledWith(expect.stringContaining('Erro ao buscar plantas'));

    mockedRepository.getInspectionPlants.mockResolvedValueOnce({ data: [], error: null });
    await act(async () => {
      fireEvent.press(screen.getByTestId('apply-filter'));
    });
    expect(mockSetMessage).toHaveBeenCalledWith(expect.stringContaining('Nenhuma planta encontrada'));
  });

  it('keeps the simulated location effective and restores the latest device location when cleared', async () => {
    const service = await renderProvider(
      createSqliteService({
        getLatestPendingInspection: jest.fn().mockResolvedValue(localInspection),
      }),
    );
    await waitFor(() => expect(screen.getByText('loaded:2')).toBeOnTheScreen());

    await act(async () => {
      fireEvent.press(screen.getByTestId('location'));
    });
    await waitFor(() => expect(screen.getByText('nearest:plant-1')).toBeOnTheScreen());
    expect(service.updateNearestPlant).toHaveBeenCalledWith(
      expect.objectContaining({ inspectionId: localInspection.id, plantId: inspectionPlant.plantId }),
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId('activate-simulation'));
      fireEvent.press(screen.getByTestId('simulation-location'));
    });
    await waitFor(() => expect(screen.getByText('nearest:plant-2')).toBeOnTheScreen());
    expect(screen.getByText(`location:${simulatedInspectionLocation.timestamp}`)).toBeOnTheScreen();

    await act(async () => {
      fireEvent.press(screen.getByTestId('device-location'));
    });
    expect(screen.getByText('nearest:plant-2')).toBeOnTheScreen();
    expect(screen.getByText(`location:${simulatedInspectionLocation.timestamp}`)).toBeOnTheScreen();

    await act(async () => {
      fireEvent.press(screen.getByTestId('deactivate-simulation'));
    });
    await waitFor(() => expect(screen.getByText('nearest:plant-1')).toBeOnTheScreen());
    expect(screen.getByText(`location:${latestDeviceInspectionLocation.timestamp}`)).toBeOnTheScreen();
  });

  it('opens modals through public actions and validates nearest plant availability', async () => {
    await renderProvider();

    await act(async () => {
      fireEvent.press(screen.getByTestId('open-filter'));
    });
    expect(screen.getByText('filter-modal:true')).toBeOnTheScreen();

    await act(async () => {
      fireEvent.press(screen.getByTestId('open-nearest'));
    });
    expect(mockSetMessage).toHaveBeenCalledWith(expect.stringContaining('Nenhuma planta'));
  });

  it('saves add occurrence changes for the nearest active plant and refreshes local state', async () => {
    const service = await renderProvider(
      createSqliteService({
        getLatestPendingInspection: jest.fn().mockResolvedValue(localInspection),
      }),
    );
    await waitFor(() => expect(screen.getByText('active:inspection-1')).toBeOnTheScreen());
    await act(async () => {
      fireEvent.press(screen.getByTestId('location'));
    });
    await waitFor(() => expect(screen.getByText('nearest:plant-1')).toBeOnTheScreen());

    await act(async () => {
      fireEvent.press(screen.getByTestId('save-change'));
    });

    await waitFor(() =>
      expect(service.addInspectionChange).toHaveBeenCalledWith(
        expect.objectContaining({
          changeType: 'add_occurrence',
          inspectionId: localInspection.id,
          occurrenceTypeId: inspectionOccurrence.occurrenceTypeId,
          previousValue: inspectionOccurrence,
          newValue: expect.objectContaining({ status: 'open' }),
        }),
      ),
    );
    expect(mockSetMessage).toHaveBeenCalledWith(expect.stringContaining('salva localmente'));
  });

  it('saves removal for an occurrence added earlier in the same offline inspection', async () => {
    const plantWithoutOccurrences = {
      ...inspectionPlant,
      occurrences: [],
    };
    const getChanges = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          ...localInspectionChange,
          change_type: 'add_occurrence',
          occurrence_code: inspectionOccurrence.code,
          occurrence_name: inspectionOccurrence.name,
          occurrence_type_id: inspectionOccurrence.occurrenceTypeId,
          plant_id: inspectionPlant.plantId,
          severity: 'media',
        },
      ]);
    const service = await renderProvider(
      createSqliteService({
        getChanges,
        getLatestPendingInspection: jest.fn().mockResolvedValue(localInspection),
        getLoadedPlants: jest.fn().mockResolvedValue([plantWithoutOccurrences, secondInspectionPlant]),
      }),
    );
    await waitFor(() => expect(screen.getByText('active:inspection-1')).toBeOnTheScreen());
    await act(async () => {
      fireEvent.press(screen.getByTestId('location'));
    });
    await waitFor(() => expect(screen.getByText('nearest:plant-1')).toBeOnTheScreen());

    await act(async () => {
      fireEvent.press(screen.getByTestId('save-add'));
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('save-remove'));
    });

    expect(service.addInspectionChange).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        changeType: 'remove_occurrence',
        newValue: expect.objectContaining({
          status: 'removed',
        }),
        previousValue: expect.objectContaining({
          occurrenceTypeId: inspectionOccurrence.occurrenceTypeId,
          status: 'open',
        }),
      }),
    );
  });

  it('blocks removal when the occurrence is absent from loaded and local offline state', async () => {
    const service = await renderProvider(
      createSqliteService({
        getChanges: jest.fn().mockResolvedValue([]),
        getLatestPendingInspection: jest.fn().mockResolvedValue(localInspection),
        getLoadedPlants: jest.fn().mockResolvedValue([{ ...inspectionPlant, occurrences: [] }, secondInspectionPlant]),
      }),
    );
    await waitFor(() => expect(screen.getByText('active:inspection-1')).toBeOnTheScreen());
    await act(async () => {
      fireEvent.press(screen.getByTestId('location'));
    });
    await waitFor(() => expect(screen.getByText('nearest:plant-1')).toBeOnTheScreen());

    await act(async () => {
      fireEvent.press(screen.getByTestId('save-remove'));
    });

    expect(service.addInspectionChange).not.toHaveBeenCalled();
    expect(mockSetMessage).toHaveBeenCalledWith(expect.stringContaining('Selecione uma ocorr'));
  });

  it('validates occurrence saving and finishing when there is no active inspection', async () => {
    await renderProvider();

    await act(async () => {
      fireEvent.press(screen.getByTestId('save-change'));
      fireEvent.press(screen.getByTestId('finish'));
    });

    expect(mockSetMessage).toHaveBeenCalledWith(expect.stringContaining('Nenhuma planta'));
    expect(mockSetMessage).toHaveBeenCalledWith(expect.stringContaining('Nenhuma inspe'));
  });

  it('blocks occurrence saving when a nearest plant exists but there is no active inspection', async () => {
    await renderProvider(
      createSqliteService({
        getLatestInspection: jest.fn().mockResolvedValue({ ...localInspection, status: 'finished' }),
        getLatestPendingInspection: jest.fn().mockResolvedValue(null),
      }),
    );

    await waitFor(() => expect(screen.getByText('active:none')).toBeOnTheScreen());
    await act(async () => {
      fireEvent.press(screen.getByTestId('location'));
    });
    await waitFor(() => expect(screen.getByText('nearest:plant-1')).toBeOnTheScreen());

    await act(async () => {
      fireEvent.press(screen.getByTestId('save-change'));
    });

    expect(mockSetMessage).toHaveBeenCalledWith(expect.stringContaining('Nenhuma inspeção ativa'));
  });

  it('finishes active inspections through the SQLite service', async () => {
    const service = await renderProvider(
      createSqliteService({
        getLatestPendingInspection: jest.fn().mockResolvedValue(localInspection),
      }),
    );
    await waitFor(() => expect(screen.getByText('active:inspection-1')).toBeOnTheScreen());

    await act(async () => {
      fireEvent.press(screen.getByTestId('finish'));
    });

    expect(service.finishInspection).toHaveBeenCalledWith(localInspection.id);
    expect(mockSetMessage).toHaveBeenCalledWith(expect.stringContaining('finalizada localmente'));
  });

  it('handles empty sync payloads, sync errors, and successful sync state reset', async () => {
    const nextInspection = {
      ...localInspection,
      id: 'inspection-2',
      finished_at: null,
      plants_changed_count: 0,
      status: 'in_progress' as const,
      sync_status: 'pending' as const,
    };
    const service = await renderProvider(
      createSqliteService({
        buildSyncPayload: jest
          .fn()
          .mockResolvedValueOnce({ deviceId: 'device-1', plantsChanged: [] })
          .mockResolvedValueOnce({ deviceId: 'device-1', plantsChanged: [{ changes: [], plantId: 'plant-1' }] })
          .mockResolvedValueOnce({ deviceId: 'device-1', plantsChanged: [{ changes: [], plantId: 'plant-1' }] }),
        createInspection: jest.fn().mockResolvedValue(nextInspection),
        getLatestPendingInspection: jest.fn().mockResolvedValue(localInspection),
        getLoadedPlants: jest
          .fn()
          .mockResolvedValueOnce([inspectionPlant, secondInspectionPlant])
          .mockResolvedValueOnce([{ ...inspectionPlant, occurrences: [] }, secondInspectionPlant]),
      }),
    );

    await waitFor(() => expect(screen.getByText('active:inspection-1')).toBeOnTheScreen());
    await act(async () => {
      fireEvent.press(screen.getByTestId('sync'));
    });
    expect(mockSetMessage).toHaveBeenCalledWith(expect.stringContaining('plantas alteradas para sincronizar'));

    mockedRepository.syncManualInspection.mockResolvedValueOnce({
      data: null,
      error: createPostgrestError('sync failed'),
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('sync'));
    });
    expect(service.markInspectionSyncError).toHaveBeenCalledWith(localInspection.id, 'sync failed');

    mockedRepository.syncManualInspection.mockResolvedValueOnce({ data: syncManualInspectionResult, error: null });
    await act(async () => {
      fireEvent.press(screen.getByTestId('sync'));
    });
    expect(service.markInspectionSyncing).toHaveBeenCalledWith(localInspection.id);
    expect(service.markInspectionSynced).toHaveBeenCalledWith(localInspection.id, syncManualInspectionResult);
    expect(service.clearLoadedPlantsChangedState).toHaveBeenCalledWith(localInspection.id);
    expect(service.createInspection).toHaveBeenCalledWith(
      {
        occurrenceCode: localInspection.occurrence_code,
        occurrenceName: localInspection.occurrence_name,
        occurrenceTypeId: localInspection.occurrence_type_id,
        zoneId: localInspection.zone_id,
        zoneName: localInspection.zone_name,
      },
      expect.arrayContaining([
        expect.objectContaining({
          distanceMeters: null,
          occurrences: [],
          isChanged: false,
          isNearest: false,
          plantId: inspectionPlant.plantId,
        }),
      ]),
    );
    expect(screen.getByText('active:inspection-2')).toBeOnTheScreen();
    expect(screen.getByText('loaded:2')).toBeOnTheScreen();
  });
});
