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

  it('selects, replaces, and deletes one simulated location point', () => {
    mockUseInspection.mockReturnValue({
      applyLocationUpdate: mockApplyLocationUpdate,
      currentLocation: inspectionLocation,
      initialRegion: inspectionLocation.coords,
      loadedPlants: [inspectionPlant],
      nearestPlant: inspectionPlant,
      setLocationSimulationActive: mockSetLocationSimulationActive,
    });

    render(<InspectionMap />);

    const firstPoint = { latitude: -23.1002, longitude: -46.1002 };
    const secondPoint = { latitude: -23.1003, longitude: -46.1003 };

    fireEvent.press(screen.getByLabelText('Marcar localização DEV'));
    fireEvent(screen.getByTestId('inspection-map'), 'press', {
      nativeEvent: { coordinate: firstPoint },
    });

    expect(mockSetLocationSimulationActive).toHaveBeenCalledWith(true);
    expect(mockApplyLocationUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        coords: expect.objectContaining(firstPoint),
      }),
      { source: 'simulation' },
    );
    expect(screen.getByTestId('inspection-simulation-marker')).toHaveProp('coordinate', firstPoint);

    fireEvent.press(screen.getByLabelText('Alterar localização DEV'));
    fireEvent(screen.getByTestId('inspection-map'), 'press', {
      nativeEvent: { coordinate: secondPoint },
    });

    expect(screen.getAllByTestId('inspection-simulation-marker')).toHaveLength(1);
    expect(screen.getByTestId('inspection-simulation-marker')).toHaveProp('coordinate', secondPoint);

    fireEvent.press(screen.getByLabelText('Excluir localização DEV'));

    expect(mockSetLocationSimulationActive).toHaveBeenLastCalledWith(false);
    expect(screen.queryByTestId('inspection-simulation-marker')).not.toBeOnTheScreen();
  });

  it('does not change location when the map is pressed before selection is armed', () => {
    mockUseInspection.mockReturnValue({
      applyLocationUpdate: mockApplyLocationUpdate,
      currentLocation: inspectionLocation,
      initialRegion: inspectionLocation.coords,
      loadedPlants: [inspectionPlant],
      nearestPlant: inspectionPlant,
      setLocationSimulationActive: mockSetLocationSimulationActive,
    });

    render(<InspectionMap />);

    fireEvent(screen.getByTestId('inspection-map'), 'press', {
      nativeEvent: { coordinate: { latitude: -23.2, longitude: -46.2 } },
    });

    expect(mockApplyLocationUpdate).not.toHaveBeenCalled();
  });
});
