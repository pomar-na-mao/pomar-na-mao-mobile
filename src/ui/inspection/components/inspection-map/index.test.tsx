import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { inspectionLocation, inspectionPlant } from '@/test/inspection/fixtures';
import { InspectionMap } from './index';

const mockUseInspection = jest.fn();
const mockApplyLocationUpdate = jest.fn();
const mockSetLocationSimulationActive = jest.fn();

jest.mock('@/ui/inspection/view-models/use-inspection', () => ({
  useInspection: () => mockUseInspection(),
}));

jest.mock('@/ui/shared/components/plant-map-markers', () => ({
  PlantMapMarkers: () => null,
}));

jest.mock('@/ui/shared/components/user-marker-location', () => ({
  UserMarkerLocation: () => null,
}));

describe('InspectionMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseInspection.mockReturnValue({
      applyLocationUpdate: mockApplyLocationUpdate,
      currentLocation: null,
      initialRegion: null,
      loadedPlants: [],
      nearestPlant: null,
      setLocationSimulationActive: mockSetLocationSimulationActive,
    });
  });

  it('renders the loading state until location is available', () => {
    render(<InspectionMap />);

    expect(screen.getByText(/Obtendo localiza/)).toBeOnTheScreen();
  });

  it('renders simulation controls when location is available', () => {
    mockUseInspection.mockReturnValue({
      applyLocationUpdate: mockApplyLocationUpdate,
      currentLocation: inspectionLocation,
      initialRegion: inspectionLocation.coords,
      loadedPlants: [inspectionPlant],
      nearestPlant: inspectionPlant,
      setLocationSimulationActive: mockSetLocationSimulationActive,
    });

    render(<InspectionMap />);

    expect(screen.getByText('Selecione P1, P2 ou P3')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('P1'));
    expect(screen.getByText('Toque no mapa para marcar P1')).toBeOnTheScreen();
  });
});
