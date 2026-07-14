import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { PlantMapMarkers, type PlantMapMarkerData } from './index';
import type { PlantMapClusterVisualization } from './visualization';

describe('PlantMapMarkers', () => {
  const plant: PlantMapMarkerData = {
    plantId: 'plant-1',
    latitude: -23,
    longitude: -49,
  };

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders plants with the same circular marker shape used by inspection', () => {
    jest.useFakeTimers();
    render(<PlantMapMarkers plantsData={[plant]} />);

    expect(screen.getByTestId('plant-map-marker-circle-plant-1')).toHaveStyle({
      borderRadius: 8,
      borderWidth: 2,
      height: 16,
      width: 16,
    });
    expect(screen.getByTestId('plant-map-marker-plant-1')).toHaveProp('tracksViewChanges', true);

    act(() => jest.runAllTimers());

    expect(screen.getByTestId('plant-map-marker-plant-1')).toHaveProp('tracksViewChanges', false);
  });

  it('calls the optional plant press handler with the pressed plant', () => {
    const onPlantPress = jest.fn();

    render(<PlantMapMarkers plantsData={[plant]} onPlantPress={onPlantPress} />);

    fireEvent.press(screen.getByTestId('plant-map-marker-plant-1'));

    expect(onPlantPress).toHaveBeenCalledWith(plant);
  });

  it('uses custom marker colors when provided', () => {
    render(<PlantMapMarkers plantsData={[{ ...plant, markerBorderColor: '#92400E', markerFillColor: '#F59E0B' }]} />);

    expect(screen.getByTestId('plant-map-marker-circle-plant-1')).toHaveStyle({
      backgroundColor: '#F59E0B',
      borderColor: '#92400E',
    });
  });

  it('renders a highlighted cluster count and routes cluster presses separately', () => {
    jest.useFakeTimers();
    const onClusterPress = jest.fn();
    const cluster: PlantMapClusterVisualization = {
      bounds: {
        northEast: { latitude: -22.9, longitude: -48.9 },
        southWest: { latitude: -23.1, longitude: -49.1 },
      },
      count: 32,
      highlightedCount: 4,
      id: 'cluster-1',
      latitude: -23,
      longitude: -49,
      type: 'cluster',
    };

    render(<PlantMapMarkers visualization={[cluster]} onClusterPress={onClusterPress} />);

    expect(screen.getByText('32')).toBeOnTheScreen();
    expect(screen.getByTestId('plant-map-cluster-cluster-1')).toHaveProp('tracksViewChanges', true);
    act(() => jest.runAllTimers());
    expect(screen.getByTestId('plant-map-cluster-cluster-1')).toHaveProp('tracksViewChanges', false);
    fireEvent.press(screen.getByTestId('plant-map-cluster-cluster-1'));
    expect(onClusterPress).toHaveBeenCalledWith(cluster);
  });
});
