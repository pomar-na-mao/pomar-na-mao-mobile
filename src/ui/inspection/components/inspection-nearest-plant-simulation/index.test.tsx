import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { InspectionNearestPlantSimulation } from './index';

describe('InspectionNearestPlantSimulation', () => {
  it('arms selection for the first simulated point', () => {
    const onSelectPoint = jest.fn();

    render(
      <InspectionNearestPlantSimulation
        hasPoint={false}
        isSelectingPoint={false}
        onClear={jest.fn()}
        onSelectPoint={onSelectPoint}
      />,
    );

    expect(screen.getByText('Defina uma localização DEV')).toBeOnTheScreen();
    fireEvent.press(screen.getByLabelText('Marcar localização DEV'));

    expect(onSelectPoint).toHaveBeenCalledTimes(1);
  });

  it('shows map instructions while point selection is armed', () => {
    render(
      <InspectionNearestPlantSimulation
        hasPoint={false}
        isSelectingPoint
        onClear={jest.fn()}
        onSelectPoint={jest.fn()}
      />,
    );

    expect(screen.getByText('Toque no mapa para definir a localização')).toBeOnTheScreen();
  });

  it('allows replacing and deleting an active point', () => {
    const onClear = jest.fn();
    const onSelectPoint = jest.fn();

    render(
      <InspectionNearestPlantSimulation
        hasPoint
        isSelectingPoint={false}
        onClear={onClear}
        onSelectPoint={onSelectPoint}
      />,
    );

    expect(screen.getByText('Localização DEV ativa')).toBeOnTheScreen();
    fireEvent.press(screen.getByLabelText('Alterar localização DEV'));
    fireEvent.press(screen.getByLabelText('Excluir localização DEV'));

    expect(onSelectPoint).toHaveBeenCalledTimes(1);
    expect(onClear).toHaveBeenCalled();
  });

  it('does not render outside development builds', () => {
    const originalDev = __DEV__;
    Object.defineProperty(globalThis, '__DEV__', {
      configurable: true,
      value: false,
    });

    try {
      render(
        <InspectionNearestPlantSimulation
          hasPoint={false}
          isSelectingPoint={false}
          onClear={jest.fn()}
          onSelectPoint={jest.fn()}
        />,
      );

      expect(screen.queryByLabelText('Marcar localização DEV')).not.toBeOnTheScreen();
    } finally {
      Object.defineProperty(globalThis, '__DEV__', {
        configurable: true,
        value: originalDev,
      });
    }
  });
});
