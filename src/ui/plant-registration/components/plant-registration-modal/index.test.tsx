/* eslint-disable @typescript-eslint/no-require-imports */
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import React from 'react';
import { PlantRegistrationModal } from '.';

const mockUsePlantRegistration = jest.fn();
const mockSavePlant = jest.fn(async () => true);

jest.mock('@/ui/plant-registration/view-models/use-plant-registration', () => ({
  usePlantRegistration: () => mockUsePlantRegistration(),
}));
jest.mock('@/ui/plant-registration/components/plant-registration-map', () => ({
  PlantRegistrationMap: () => {
    const { View } = require('react-native');
    return <View testID="plant-registration-map" />;
  },
}));

describe('PlantRegistrationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePlantRegistration.mockReturnValue({
      closeModal: jest.fn(),
      currentLocation: {
        coords: {
          latitude: -23.5,
          longitude: -46.6,
          accuracy: 3,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: 1,
      },
      isModalVisible: true,
      isSaving: false,
      locationError: null,
      locationState: 'ready',
      retryLocation: jest.fn(),
      savePlant: mockSavePlant,
      varieties: [{ id: 7, name: 'Gala' }],
      zones: [{ id: 'zone-1', name: 'Norte' }],
    });
  });

  it('shows a map and disabled coordinates captured from the device', () => {
    render(<PlantRegistrationModal />);

    expect(screen.getByTestId('plant-registration-map')).toBeOnTheScreen();
    expect(screen.getByLabelText('Latitude, preenchida automaticamente')).toBeDisabled();
    expect(screen.getByLabelText('Longitude, preenchida automaticamente')).toBeDisabled();
    expect(screen.getByText(/GPS: 3\.0 m/)).toBeOnTheScreen();
    expect(screen.getByLabelText('Variedade')).toHaveStyle({ height: 54 });
  });

  it('keeps the map and actions outside the scrollable form', () => {
    render(<PlantRegistrationModal />);

    const formScroll = screen.getByTestId('plant-registration-form-scroll');
    expect(within(formScroll).getByLabelText('Latitude, preenchida automaticamente')).toBeOnTheScreen();
    expect(within(formScroll).queryByTestId('plant-registration-map')).toBeNull();
    expect(within(formScroll).queryByRole('button', { name: 'Salvar' })).toBeNull();
    expect(screen.getByTestId('plant-registration-actions')).toBeOnTheScreen();
  });

  it('keeps save disabled until variety and zone are selected', () => {
    render(<PlantRegistrationModal />);

    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('shows a retry action when location acquisition fails', () => {
    const retryLocation = jest.fn();
    mockUsePlantRegistration.mockReturnValue({
      ...mockUsePlantRegistration(),
      currentLocation: null,
      locationState: 'error',
      locationError: 'Permissão negada.',
      retryLocation,
    });
    render(<PlantRegistrationModal />);

    expect(screen.getByRole('alert')).toHaveTextContent('Permissão negada.');
    fireEvent.press(screen.getByText('Tentar novamente'));
    expect(retryLocation).toHaveBeenCalled();
  });
});
