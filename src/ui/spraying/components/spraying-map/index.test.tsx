import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { PlantMapMarkerData } from '@/ui/shared/components/plant-map-markers';
import type { PlantMapVisualization } from '@/ui/shared/components/plant-map-markers/visualization';
import { sprayingAggregateFixture } from '@/test/spraying/fixtures';
import { SprayingMap } from './index';

const mockUseSpraying = jest.fn();
const mockPlantMapMarkers = jest.fn();
const mockPrepareRouteSimulation = jest.fn();
const mockRecordSimulatedLocation = jest.fn();
const mockTogglePlant = jest.fn();
const mockUserMarkerLocation = jest.fn();

jest.mock('@/ui/spraying/view-models/use-spraying', () => ({
  useSpraying: () => mockUseSpraying(),
}));

jest.mock('@/ui/shared/components/plant-map-markers', () => {
  const { View } = jest.requireActual('react-native');

  return {
    PlantMapMarkers: (props: unknown) => {
      mockPlantMapMarkers(props);
      return <View testID="plant-map-markers" />;
    },
  };
});

jest.mock('@/ui/shared/components/user-marker-location', () => ({
  UserMarkerLocation: (props: unknown) => {
    mockUserMarkerLocation(props);
    return null;
  },
}));

describe('SprayingMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrepareRouteSimulation.mockResolvedValue(true);
    mockUseSpraying.mockReturnValue({
      aggregate: null,
      currentLocation: null,
      prepareRouteSimulation: mockPrepareRouteSimulation,
      recordSimulatedLocation: mockRecordSimulatedLocation,
      selectedZonePlants: [],
      togglePlant: mockTogglePlant,
    });
  });

  it('renders loaded zone plants through the shared inspection circle markers', () => {
    mockUseSpraying.mockReturnValue({
      aggregate: null,
      currentLocation: null,
      prepareRouteSimulation: mockPrepareRouteSimulation,
      recordSimulatedLocation: mockRecordSimulatedLocation,
      selectedZonePlants: sprayingAggregateFixture.plants,
      togglePlant: mockTogglePlant,
    });

    render(<SprayingMap />);

    const markerProps = mockPlantMapMarkers.mock.calls[0]?.[0] as {
      visualization: PlantMapVisualization[];
    };
    const plant = markerProps.visualization[0];

    expect(plant).toMatchObject({ type: 'plant' });
    expect(plant.type === 'plant' ? plant.plant : null).toEqual(
      expect.objectContaining({
        plantId: 'plant-1',
        latitude: sprayingAggregateFixture.plants[0]?.latitude,
        longitude: sprayingAggregateFixture.plants[0]?.longitude,
      }),
    );
    expect(plant.type === 'plant' ? plant.plant : null).not.toHaveProperty('isChanged');
    expect(plant.type === 'plant' ? plant.plant : null).not.toHaveProperty('markerFillColor');
  });

  it('highlights affected plants on the map for direct review', () => {
    mockUseSpraying.mockReturnValue({
      aggregate: {
        ...sprayingAggregateFixture,
        operation: {
          ...sprayingAggregateFixture.operation,
          lifecycle_status: 'simulated',
        },
        plants: [{ ...sprayingAggregateFixture.plants[0], reviewStatus: 'confirmed' }],
      },
      currentLocation: null,
      prepareRouteSimulation: mockPrepareRouteSimulation,
      recordSimulatedLocation: mockRecordSimulatedLocation,
      selectedZonePlants: [],
      togglePlant: mockTogglePlant,
    });

    render(<SprayingMap />);

    const markerProps = mockPlantMapMarkers.mock.calls[0]?.[0] as {
      visualization: PlantMapVisualization[];
    };
    const plant = markerProps.visualization[0];

    expect(plant.type === 'plant' ? plant.plant : null).toEqual(
      expect.objectContaining({
        markerBorderColor: '#92400E',
        markerFillColor: '#F59E0B',
      }),
    );
  });

  it('keeps simulated review toggling through circle marker presses', () => {
    mockUseSpraying.mockReturnValue({
      aggregate: {
        ...sprayingAggregateFixture,
        operation: {
          ...sprayingAggregateFixture.operation,
          lifecycle_status: 'simulated',
        },
      },
      currentLocation: null,
      prepareRouteSimulation: mockPrepareRouteSimulation,
      recordSimulatedLocation: mockRecordSimulatedLocation,
      selectedZonePlants: [],
      togglePlant: mockTogglePlant,
    });

    render(<SprayingMap />);

    const markerProps = mockPlantMapMarkers.mock.calls[0]?.[0] as {
      onPlantPress: (plant: PlantMapMarkerData) => void;
    };
    markerProps.onPlantPress({ plantId: 'plant-1', latitude: -23, longitude: -49 });

    expect(mockTogglePlant).toHaveBeenCalledWith(sprayingAggregateFixture.plants[0]);
  });

  it('expands clusters without toggling a spraying plant', () => {
    mockUseSpraying.mockReturnValue({
      aggregate: null,
      currentLocation: null,
      prepareRouteSimulation: mockPrepareRouteSimulation,
      recordSimulatedLocation: mockRecordSimulatedLocation,
      selectedZonePlants: sprayingAggregateFixture.plants,
      togglePlant: mockTogglePlant,
    });
    render(<SprayingMap />);
    const markerProps = mockPlantMapMarkers.mock.calls[0]?.[0] as {
      onClusterPress: (cluster: Extract<PlantMapVisualization, { type: 'cluster' }>) => void;
    };

    markerProps.onClusterPress({
      bounds: {
        northEast: { latitude: -22.9, longitude: -48.9 },
        southWest: { latitude: -23.1, longitude: -49.1 },
      },
      count: 20,
      highlightedCount: 2,
      id: 'cluster-1',
      latitude: -23,
      longitude: -49,
      type: 'cluster',
    });

    expect(mockTogglePlant).not.toHaveBeenCalled();
  });

  it('records a DEV route simulation from P1 to P2 while tracking', async () => {
    mockUseSpraying.mockReturnValue({
      aggregate: {
        ...sprayingAggregateFixture,
        operation: {
          ...sprayingAggregateFixture.operation,
          lifecycle_status: 'tracking',
        },
      },
      currentLocation: null,
      prepareRouteSimulation: mockPrepareRouteSimulation,
      recordSimulatedLocation: mockRecordSimulatedLocation,
      selectedZonePlants: [],
      togglePlant: mockTogglePlant,
    });

    render(<SprayingMap />);

    fireEvent.press(screen.getByLabelText('Marcar P1'));
    fireEvent(screen.getByTestId('spraying-map'), 'press', {
      nativeEvent: { coordinate: { latitude: -23, longitude: -49 } },
    });
    fireEvent.press(screen.getByLabelText('Marcar P2'));
    fireEvent(screen.getByTestId('spraying-map'), 'press', {
      nativeEvent: { coordinate: { latitude: -23.00001, longitude: -49.00001 } },
    });

    expect(screen.getByTestId('spraying-simulation-point-0')).toHaveProp('pinColor', '#DC2626');
    expect(screen.getByTestId('spraying-simulation-point-1')).toHaveProp('pinColor', '#DC2626');

    fireEvent.press(screen.getByLabelText('Iniciar simulacao de rota'));

    expect(mockPrepareRouteSimulation).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockRecordSimulatedLocation).toHaveBeenCalledWith(
        expect.objectContaining({
          coords: expect.objectContaining({
            latitude: -23,
            longitude: -49,
          }),
        }),
      );
    });

    fireEvent.press(screen.getByLabelText('Parar simulacao de rota'));
  });

  it('keeps the user marker on the simulated location while DEV simulation is running', async () => {
    mockUseSpraying.mockReturnValue({
      aggregate: {
        ...sprayingAggregateFixture,
        operation: {
          ...sprayingAggregateFixture.operation,
          lifecycle_status: 'tracking',
        },
      },
      currentLocation: {
        coords: {
          accuracy: 1,
          altitude: 0,
          altitudeAccuracy: 1,
          heading: 0,
          latitude: -22,
          longitude: -48,
          speed: 0,
        },
        timestamp: 1,
      },
      prepareRouteSimulation: mockPrepareRouteSimulation,
      recordSimulatedLocation: mockRecordSimulatedLocation,
      selectedZonePlants: [],
      togglePlant: mockTogglePlant,
    });

    render(<SprayingMap />);

    fireEvent.press(screen.getByLabelText('Marcar P1'));
    fireEvent(screen.getByTestId('spraying-map'), 'press', {
      nativeEvent: { coordinate: { latitude: -23, longitude: -49 } },
    });
    fireEvent.press(screen.getByLabelText('Marcar P2'));
    fireEvent(screen.getByTestId('spraying-map'), 'press', {
      nativeEvent: { coordinate: { latitude: -23.00001, longitude: -49.00001 } },
    });
    fireEvent.press(screen.getByLabelText('Iniciar simulacao de rota'));

    await waitFor(() => {
      expect(mockUserMarkerLocation).toHaveBeenLastCalledWith(
        expect.objectContaining({
          coordinate: {
            latitude: -23,
            longitude: -49,
          },
        }),
      );
    });

    fireEvent.press(screen.getByLabelText('Parar simulacao de rota'));
  });

  it('clears manual simulation points and previous route when aggregate becomes null', async () => {
    mockUseSpraying.mockReturnValue({
      aggregate: {
        ...sprayingAggregateFixture,
        operation: {
          ...sprayingAggregateFixture.operation,
          lifecycle_status: 'tracking',
        },
      },
      currentLocation: null,
      prepareRouteSimulation: mockPrepareRouteSimulation,
      recordSimulatedLocation: mockRecordSimulatedLocation,
      selectedZonePlants: [],
      togglePlant: mockTogglePlant,
    });

    const { rerender } = render(<SprayingMap />);

    fireEvent.press(screen.getByLabelText('Marcar P1'));
    fireEvent(screen.getByTestId('spraying-map'), 'press', {
      nativeEvent: { coordinate: { latitude: -23, longitude: -49 } },
    });
    fireEvent.press(screen.getByLabelText('Marcar P2'));
    fireEvent(screen.getByTestId('spraying-map'), 'press', {
      nativeEvent: { coordinate: { latitude: -23.00001, longitude: -49.00001 } },
    });

    expect(screen.getByTestId('spraying-simulation-point-0')).toBeOnTheScreen();
    expect(screen.getByTestId('spraying-simulation-point-1')).toBeOnTheScreen();

    mockUseSpraying.mockReturnValue({
      aggregate: null,
      currentLocation: null,
      prepareRouteSimulation: mockPrepareRouteSimulation,
      recordSimulatedLocation: mockRecordSimulatedLocation,
      selectedZonePlants: [],
      togglePlant: mockTogglePlant,
    });

    rerender(<SprayingMap />);

    expect(screen.queryByTestId('spraying-simulation-point-0')).toBeNull();
    expect(screen.queryByTestId('spraying-simulation-point-1')).toBeNull();
  });
});
