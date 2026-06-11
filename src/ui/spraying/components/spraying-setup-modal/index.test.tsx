import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SprayingSetupModal } from '.';

const mockCloseSetup = jest.fn();
const mockBeginOperation = jest.fn();

jest.mock('@/ui/spraying/view-models/use-spraying', () => ({
  useSpraying: () => ({
    beginOperation: mockBeginOperation,
    closeSetup: mockCloseSetup,
    isSetupVisible: true,
    selectedZone: { id: 'zone-1', name: 'Talhao 1' },
  }),
}));

describe('SprayingSetupModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates required setup fields', () => {
    render(<SprayingSetupModal />);

    fireEvent.press(screen.getByText('Confirmar e iniciar'));

    expect(screen.getByText(/Informe operador e nome/)).toBeOnTheScreen();
    expect(mockBeginOperation).not.toHaveBeenCalled();
  });

  it('labels the treatment band distances', () => {
    render(<SprayingSetupModal />);

    expect(screen.getByText('Distância típica planta-trator (m)')).toBeOnTheScreen();
    expect(screen.getByText('Alcance máximo da pulverização (m)')).toBeOnTheScreen();
  });

  it('allows the form to scroll while the keyboard is open', () => {
    render(<SprayingSetupModal />);

    expect(screen.getByTestId('spraying-setup-keyboard-avoiding-view')).toBeOnTheScreen();
    expect(screen.getByTestId('spraying-setup-scroll')).toHaveProp('keyboardShouldPersistTaps', 'handled');
    expect(screen.getByTestId('spraying-setup-scroll')).toHaveProp('keyboardDismissMode', 'on-drag');
  });

  it('submits a valid operation with optional machine and the default treatment band', () => {
    render(<SprayingSetupModal />);

    fireEvent.changeText(screen.getByLabelText('Operador'), 'Operador');
    fireEvent.changeText(screen.getByLabelText('Produto 1'), 'Produto X');
    fireEvent.press(screen.getByText('Confirmar e iniciar'));

    expect(mockBeginOperation).toHaveBeenCalledWith(
      expect.objectContaining({
        zoneId: 'zone-1',
        zoneName: 'Talhao 1',
        operatorName: 'Operador',
        machineName: '',
        minDistanceMeters: 3.5,
        maxDistanceMeters: 9,
        inputs: [expect.objectContaining({ productName: 'Produto X' })],
      }),
    );
  });
});
