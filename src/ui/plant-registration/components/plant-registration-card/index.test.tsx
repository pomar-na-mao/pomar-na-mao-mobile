import type { LocalPlantRegistration } from '@/domain/models/plant-registration';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { PlantRegistrationCard } from '.';

jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => ({
  __esModule: true,
  default: ({
    children,
    renderLeftActions,
    renderRightActions,
  }: {
    children: React.ReactNode;
    renderLeftActions?: Function;
    renderRightActions?: Function;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    const methods = { close: jest.fn() };
    return (
      <View>
        {children}
        {renderLeftActions?.(null, null, methods)}
        {renderRightActions?.(null, null, methods)}
      </View>
    );
  },
}));

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

describe('PlantRegistrationCard', () => {
  it('renders readable data and both swipe/non-gesture actions', () => {
    const onDelete = jest.fn();
    const onSync = jest.fn();
    render(<PlantRegistrationCard isOnline plant={plant} onDelete={onDelete} onSync={onSync} />);

    expect(screen.getByText('Gala')).toBeOnTheScreen();
    expect(screen.getByText('Norte')).toBeOnTheScreen();
    expect(screen.getByLabelText('Status: Pendente')).toBeOnTheScreen();
    expect(screen.getByTestId('plant-registration-delete-local-1')).toHaveStyle({ minHeight: 44 });
    expect(screen.getByTestId('plant-registration-sync-local-1')).toHaveStyle({ minHeight: 44 });

    fireEvent.press(screen.getByTestId('plant-registration-swipe-delete-local-1'));
    fireEvent.press(screen.getByTestId('plant-registration-swipe-sync-local-1'));
    expect(onDelete).toHaveBeenCalledWith(plant);
    expect(onSync).toHaveBeenCalledWith('local-1');
  });

  it('disables synchronization after success', () => {
    render(
      <PlantRegistrationCard
        isOnline
        plant={{ ...plant, sync_status: 'synced' }}
        onDelete={jest.fn()}
        onSync={jest.fn()}
      />,
    );
    expect(screen.getByTestId('plant-registration-sync-local-1')).toBeDisabled();
    expect(screen.queryByTestId('plant-registration-swipe-sync-local-1')).toBeNull();
  });

  it('shows tactile visual feedback and keeps the visible actions working', () => {
    const onDelete = jest.fn();
    const onSync = jest.fn();
    render(<PlantRegistrationCard isOnline plant={plant} onDelete={onDelete} onSync={onSync} />);
    const deleteButton = screen.getByTestId('plant-registration-delete-local-1');
    const syncButton = screen.getByTestId('plant-registration-sync-local-1');

    fireEvent(deleteButton, 'pressIn');
    expect(deleteButton).toHaveStyle({ opacity: 0.72, transform: [{ scale: 0.97 }] });
    fireEvent(deleteButton, 'pressOut');

    fireEvent(syncButton, 'pressIn');
    expect(syncButton).toHaveStyle({ opacity: 0.72, transform: [{ scale: 0.97 }] });
    fireEvent(syncButton, 'pressOut');

    fireEvent.press(deleteButton);
    fireEvent.press(syncButton);
    expect(onDelete).toHaveBeenCalledWith(plant);
    expect(onSync).toHaveBeenCalledWith('local-1');
  });

  it('disables synchronization while there is no internet connection', () => {
    const onSync = jest.fn();
    render(<PlantRegistrationCard isOnline={false} plant={plant} onDelete={jest.fn()} onSync={onSync} />);

    const syncButton = screen.getByTestId('plant-registration-sync-local-1');
    expect(syncButton).toBeDisabled();
    expect(syncButton).toHaveStyle({ opacity: 0.5 });
    expect(screen.queryByTestId('plant-registration-swipe-sync-local-1')).toBeNull();

    fireEvent.press(syncButton);
    expect(onSync).not.toHaveBeenCalled();
  });
});
