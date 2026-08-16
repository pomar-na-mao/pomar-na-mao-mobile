/* eslint-disable @typescript-eslint/no-require-imports */
import type { LocalPlantRegistration } from '@/domain/models/plant-registration';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Network from 'expo-network';
import React from 'react';
import { PlantRegistrationScreen } from '.';

const mockOpenModal = jest.fn();
const mockDeleteAllPlants = jest.fn();
const mockSyncAllPlants = jest.fn();
const mockUsePlantRegistration = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock('expo-network', () => ({ useNetworkState: jest.fn() }));
jest.mock('@/ui/plant-registration/view-models/use-plant-registration', () => ({
  usePlantRegistration: () => mockUsePlantRegistration(),
}));
jest.mock('@/ui/plant-registration/components/plant-registration-modal', () => ({
  PlantRegistrationModal: () => null,
}));
jest.mock('@/ui/plant-registration/components/plant-registration-card', () => ({
  PlantRegistrationCard: ({ isOnline, plant }: { isOnline: boolean; plant: LocalPlantRegistration }) => {
    const { Text } = require('react-native');
    return <Text testID={`plant-registration-network-${plant.id}`}>{`${plant.variety_name}:${isOnline}`}</Text>;
  },
}));

const mockedNetwork = jest.mocked(Network);

const plant: LocalPlantRegistration = {
  id: 'local-1',
  local_id: 'local-1',
  latitude: -23.5,
  longitude: -46.6,
  variety_id: 7,
  variety_name: 'Gala',
  zone_id: 'zone-1',
  zone_name: 'Norte',
  planting_date: '2026-08-01T00:00:00.000Z',
  is_dead: 0,
  is_new: 1,
  non_existent: 0,
  created_at: '2026-08-12T12:00:00.000Z',
  updated_at: '2026-08-12T12:00:00.000Z',
  sync_status: 'pending_create',
  device_id: 'device-1',
  record_origin: 'local_registration',
};

describe('PlantRegistrationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedNetwork.useNetworkState.mockReturnValue({ isConnected: true, isInternetReachable: true });
    mockUsePlantRegistration.mockReturnValue({
      deleteAllPlants: mockDeleteAllPlants,
      deletePlant: jest.fn(),
      isSyncingAll: false,
      openModal: mockOpenModal,
      plants: [],
      syncAllPlants: mockSyncAllPlants,
      syncPlant: jest.fn(),
    });
  });

  it('shows a useful empty state and opens the registration modal', () => {
    render(<PlantRegistrationScreen />);

    expect(screen.getByText('Nenhuma planta adicionada')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Adicionar primeira planta' }));
    expect(mockOpenModal).toHaveBeenCalledTimes(1);
  });

  it('renders local plants and keeps a labeled add action', () => {
    mockUsePlantRegistration.mockReturnValue({
      deleteAllPlants: mockDeleteAllPlants,
      deletePlant: jest.fn(),
      isSyncingAll: false,
      openModal: mockOpenModal,
      plants: [plant],
      syncAllPlants: mockSyncAllPlants,
      syncPlant: jest.fn(),
    });
    render(<PlantRegistrationScreen />);

    expect(screen.getByText('Gala:true')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Excluir todas as plantas da lista' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Sincronizar todas as plantas pendentes' })).toBeEnabled();
    const addButton = screen.getByRole('button', { name: 'Adicionar nova planta' });
    expect(addButton).toHaveStyle({ minHeight: 52 });
    fireEvent.press(addButton);
    expect(mockOpenModal).toHaveBeenCalledTimes(1);
  });

  it('passes offline connectivity to plant cards', () => {
    mockedNetwork.useNetworkState.mockReturnValue({ isConnected: false, isInternetReachable: false });
    mockUsePlantRegistration.mockReturnValue({
      deleteAllPlants: mockDeleteAllPlants,
      deletePlant: jest.fn(),
      isSyncingAll: false,
      openModal: mockOpenModal,
      plants: [plant],
      syncAllPlants: mockSyncAllPlants,
      syncPlant: jest.fn(),
    });

    render(<PlantRegistrationScreen />);

    expect(screen.getByText('Gala:false')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Sincronizar todas as plantas pendentes' })).toBeDisabled();
  });

  it('synchronizes all pending plants and confirms deletion of the full local list', () => {
    mockUsePlantRegistration.mockReturnValue({
      deleteAllPlants: mockDeleteAllPlants,
      deletePlant: jest.fn(),
      isSyncingAll: false,
      openModal: mockOpenModal,
      plants: [plant],
      syncAllPlants: mockSyncAllPlants,
      syncPlant: jest.fn(),
    });
    render(<PlantRegistrationScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Sincronizar todas as plantas pendentes' }));
    expect(mockSyncAllPlants).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByRole('button', { name: 'Excluir todas as plantas da lista' }));
    expect(screen.getByText('Excluir todas as plantas?')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Sim'));
    expect(mockDeleteAllPlants).toHaveBeenCalledTimes(1);
  });
});
