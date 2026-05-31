import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { EMPTY_SIMULATION_POINTS } from '@/ui/inspection/helpers/simulation-route';
import { InspectionNearestPlantSimulation } from './index';

describe('InspectionNearestPlantSimulation', () => {
  it('renders point controls and emits point selection callbacks', () => {
    const onSelectPoint = jest.fn();

    render(
      <InspectionNearestPlantSimulation
        isRunning={false}
        onClear={jest.fn()}
        onSelectPoint={onSelectPoint}
        onStart={jest.fn()}
        onStop={jest.fn()}
        points={EMPTY_SIMULATION_POINTS}
        selectedPointIndex={null}
      />,
    );

    expect(screen.getByText('Selecione P1, P2 ou P3')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('P1'));
    fireEvent.press(screen.getByText('P2'));
    fireEvent.press(screen.getByText('P3'));

    expect(onSelectPoint).toHaveBeenCalledWith(0);
    expect(onSelectPoint).toHaveBeenCalledWith(1);
    expect(onSelectPoint).toHaveBeenCalledWith(2);
  });

  it('shows selected point instructions and action callbacks', () => {
    const onClear = jest.fn();
    const onStart = jest.fn();
    const onStop = jest.fn();
    const points = [
      { latitude: -23.1, longitude: -46.1 },
      { latitude: -23.1001, longitude: -46.1001 },
      { latitude: -23.1002, longitude: -46.1002 },
    ] as const;

    render(
      <InspectionNearestPlantSimulation
        isRunning
        onClear={onClear}
        onSelectPoint={jest.fn()}
        onStart={onStart}
        onStop={onStop}
        points={[...points]}
        selectedPointIndex={1}
      />,
    );

    expect(screen.getByText('Toque no mapa para marcar P2')).toBeOnTheScreen();
    const buttons = screen.getAllByRole('button');

    fireEvent.press(buttons[3]);
    fireEvent.press(buttons[4]);
    fireEvent.press(buttons[5]);

    expect(onStart).not.toHaveBeenCalled();
    expect(onStop).toHaveBeenCalled();
    expect(onClear).not.toHaveBeenCalled();
  });

  it('starts and clears when not running and all points are available', () => {
    const onClear = jest.fn();
    const onStart = jest.fn();

    render(
      <InspectionNearestPlantSimulation
        isRunning={false}
        onClear={onClear}
        onSelectPoint={jest.fn()}
        onStart={onStart}
        onStop={jest.fn()}
        points={[
          { latitude: -23.1, longitude: -46.1 },
          { latitude: -23.1001, longitude: -46.1001 },
          { latitude: -23.1002, longitude: -46.1002 },
        ]}
        selectedPointIndex={null}
      />,
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.press(buttons[3]);
    fireEvent.press(buttons[5]);

    expect(onStart).toHaveBeenCalled();
    expect(onClear).toHaveBeenCalled();
  });
});
