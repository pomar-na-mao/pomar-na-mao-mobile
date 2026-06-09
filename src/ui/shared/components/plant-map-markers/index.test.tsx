import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PlantMapMarkers, type PlantMapMarkerData } from './index';

describe('PlantMapMarkers', () => {
  const plant: PlantMapMarkerData = {
    plantId: 'plant-1',
    latitude: -23,
    longitude: -49,
  };

  it('renders plants with the same circular marker shape used by inspection', () => {
    render(<PlantMapMarkers plantsData={[plant]} />);

    expect(screen.getByTestId('plant-map-marker-circle-plant-1')).toHaveStyle({
      borderRadius: 8,
      borderWidth: 2,
      height: 16,
      width: 16,
    });
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
});
