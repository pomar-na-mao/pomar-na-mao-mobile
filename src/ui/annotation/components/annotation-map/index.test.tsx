import { annotationLocation } from '@/test/annotation/fixtures';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { AnnotationMap } from './index';

const mockUseAnnotation = jest.fn();
const mockApplyLocationUpdate = jest.fn();
const mockSetLocationSimulationActive = jest.fn();

jest.mock('@/ui/annotation/view-models/use-annotation', () => ({
  useAnnotation: () => mockUseAnnotation(),
}));

jest.mock('@/ui/shared/components/user-marker-location', () => ({
  UserMarkerLocation: () => null,
}));

describe('AnnotationMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAnnotation.mockReturnValue({
      applyLocationUpdate: mockApplyLocationUpdate,
      currentLocation: null,
      initialRegion: null,
      setLocationSimulationActive: mockSetLocationSimulationActive,
    });
  });

  it('renders the loading state until location is available', () => {
    render(<AnnotationMap />);

    expect(screen.getByText(/Obtendo localiza/)).toBeOnTheScreen();
  });

  it('selects, replaces, and deletes one simulated location point', () => {
    mockUseAnnotation.mockReturnValue({
      applyLocationUpdate: mockApplyLocationUpdate,
      currentLocation: annotationLocation,
      initialRegion: annotationLocation.coords,
      setLocationSimulationActive: mockSetLocationSimulationActive,
    });

    render(<AnnotationMap />);

    const firstPoint = { latitude: -23.1002, longitude: -46.1002 };
    const secondPoint = { latitude: -23.1003, longitude: -46.1003 };

    fireEvent.press(screen.getByLabelText('Marcar localização DEV'));
    fireEvent(screen.getByTestId('annotation-map'), 'press', {
      nativeEvent: { coordinate: firstPoint },
    });

    expect(mockSetLocationSimulationActive).toHaveBeenCalledWith(true);
    expect(mockApplyLocationUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        coords: expect.objectContaining(firstPoint),
      }),
      { source: 'simulation' },
    );
    expect(screen.getByTestId('annotation-simulation-marker')).toHaveProp('coordinate', firstPoint);

    fireEvent.press(screen.getByLabelText('Alterar localização DEV'));
    fireEvent(screen.getByTestId('annotation-map'), 'press', {
      nativeEvent: { coordinate: secondPoint },
    });

    expect(screen.getAllByTestId('annotation-simulation-marker')).toHaveLength(1);
    expect(screen.getByTestId('annotation-simulation-marker')).toHaveProp('coordinate', secondPoint);

    fireEvent.press(screen.getByLabelText('Excluir localização DEV'));

    expect(mockSetLocationSimulationActive).toHaveBeenLastCalledWith(false);
    expect(screen.queryByTestId('annotation-simulation-marker')).not.toBeOnTheScreen();
  });

  it('does not change location when the map is pressed before selection is armed', () => {
    mockUseAnnotation.mockReturnValue({
      applyLocationUpdate: mockApplyLocationUpdate,
      currentLocation: annotationLocation,
      initialRegion: annotationLocation.coords,
      setLocationSimulationActive: mockSetLocationSimulationActive,
    });

    render(<AnnotationMap />);

    fireEvent(screen.getByTestId('annotation-map'), 'press', {
      nativeEvent: { coordinate: { latitude: -23.2, longitude: -46.2 } },
    });

    expect(mockApplyLocationUpdate).not.toHaveBeenCalled();
  });
});
