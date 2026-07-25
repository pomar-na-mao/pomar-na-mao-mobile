import { sprayingOperationFixture } from '@/test/spraying/fixtures';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SprayingListScreen } from '.';

const mockOpenMapView = jest.fn();
const mockSyncOperationById = jest.fn();
const mockDeleteOperationById = jest.fn();
const mockBack = jest.fn();

const mockState = {
  operationsList: [] as (typeof sprayingOperationFixture)[],
};

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

jest.mock('@/ui/spraying/view-models/use-spraying', () => ({
  useSpraying: () => ({
    ...mockState,
    deleteOperationById: mockDeleteOperationById,
    openMapView: mockOpenMapView,
    syncOperationById: mockSyncOperationById,
  }),
}));

jest.mock('@/ui/shared/components/confirmation-modal', () => ({
  ConfirmationModal: ({ onConfirm, visible }: { onConfirm: () => void; visible: boolean }) => {
    if (!visible) return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID="confirm-delete" onPress={onConfirm}>
        <Text>Confirmar exclusao</Text>
      </Pressable>
    );
  },
}));

describe('SprayingListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState.operationsList = [];
  });

  it('renders empty state when no operations exist', () => {
    render(<SprayingListScreen />);

    expect(screen.getByText('Nenhuma pulverização')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('empty-new-spraying-btn'));
    expect(mockOpenMapView).toHaveBeenCalled();
  });

  it('renders operation list items and handles actions', () => {
    mockState.operationsList = [
      {
        ...sprayingOperationFixture,
        id: 'op-1',
        title: 'Pulverização Talhão 1',
        lifecycle_status: 'reviewed',
      },
    ];

    render(<SprayingListScreen />);

    expect(screen.getByText('Pulverização Talhão 1')).toBeOnTheScreen();
    expect(screen.getByText('Revisada')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('sync-btn-op-1'));
    expect(mockSyncOperationById).toHaveBeenCalledWith('op-1');

    fireEvent.press(screen.getByTestId('view-map-btn-op-1'));
    expect(mockOpenMapView).toHaveBeenCalledWith('op-1');
  });

  it('allows deleting an operation after confirmation', async () => {
    mockState.operationsList = [
      {
        ...sprayingOperationFixture,
        id: 'op-2',
        title: 'Pulverização Talhão 2',
        lifecycle_status: 'finished',
      },
    ];

    render(<SprayingListScreen />);

    fireEvent.press(screen.getByTestId('delete-btn-op-2'));
    expect(mockDeleteOperationById).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByTestId('confirm-delete'));
    });
    expect(mockDeleteOperationById).toHaveBeenCalledWith('op-2');
  });
});
