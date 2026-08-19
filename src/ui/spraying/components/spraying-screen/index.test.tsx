import { sprayingAggregateFixture } from '@/test/spraying/fixtures';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SprayingScreen } from '.';

const mockOpenListView = jest.fn();
const mockOpenSetup = jest.fn();
const mockOpenZoneSelection = jest.fn();
const mockStartTracking = jest.fn();
const mockFinishTracking = jest.fn();
const mockSimulate = jest.fn();
const mockConfirmReview = jest.fn();
const mockSyncOperation = jest.fn();
const mockDeleteActiveOperation = jest.fn();

const mockState = {
  aggregate: null as typeof sprayingAggregateFixture | null,
  selectedZone: null as { id: string; name: string } | null,
  selectedZonePlants: [] as typeof sprayingAggregateFixture.plants,
  trackingState: 'inactive',
};

jest.mock('@/ui/spraying/view-models/use-spraying', () => ({
  useSpraying: () => ({
    ...mockState,
    confirmReview: mockConfirmReview,
    deleteActiveOperation: mockDeleteActiveOperation,
    finishTracking: mockFinishTracking,
    openListView: mockOpenListView,
    openSetup: mockOpenSetup,
    openZoneSelection: mockOpenZoneSelection,
    simulate: mockSimulate,
    startTracking: mockStartTracking,
    syncOperation: mockSyncOperation,
  }),
}));

jest.mock('@/ui/spraying/components/spraying-map', () => ({
  SprayingMap: () => null,
}));

jest.mock('@/ui/spraying/components/spraying-setup-modal', () => ({
  SprayingSetupModal: () => null,
}));

jest.mock('@/ui/spraying/components/spraying-zone-modal', () => ({
  SprayingZoneModal: () => null,
}));

jest.mock('@/ui/spraying/components/spraying-review-modal', () => ({
  SprayingReviewModal: () => null,
}));

jest.mock('@/ui/shared/components/confirmation-modal', () => ({
  ConfirmationModal: ({ onConfirm, visible }: { onConfirm: () => void; visible: boolean }) => {
    if (!visible) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID="confirm-delete" onPress={onConfirm}>
        <Text>Confirmar exclusao</Text>
      </Pressable>
    );
  },
}));

describe('SprayingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState.aggregate = null;
    mockState.selectedZone = null;
    mockState.selectedZonePlants = [];
    mockState.trackingState = 'inactive';
  });

  it('starts by asking the user to configure a zone', () => {
    render(<SprayingScreen />);

    expect(screen.getByText('Nova Pulverização')).toBeOnTheScreen();
    expect(screen.getByText('Exibir plantas')).toBeOnTheScreen();
    expect(screen.getByTestId('spraying-action-bar')).toHaveStyle({ backgroundColor: 'transparent' });
    expect(screen.getByTestId('spraying-summary-panel')).toHaveStyle({ top: 44 });
    expect(screen.getByText('Carregue as plantas de uma zona')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('back-to-list-btn'));
    fireEvent.press(screen.getByText('Exibir plantas'));

    expect(mockOpenListView).toHaveBeenCalled();
    expect(mockOpenZoneSelection).toHaveBeenCalled();
    expect(mockOpenSetup).not.toHaveBeenCalled();
  });

  it('starts zone confirmation before operation setup when a zone is already loaded', () => {
    mockState.selectedZone = { id: 'zone-1', name: 'Talhao 1' };
    mockState.selectedZonePlants = sprayingAggregateFixture.plants;

    render(<SprayingScreen />);

    expect(screen.getByText('Iniciar')).toBeOnTheScreen();
    expect(screen.getByLabelText('Excluir estado local de pulverização')).toBeOnTheScreen();
    expect(screen.getByText(/Talhao 1 - .* plantas carregadas/)).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Iniciar'));
    expect(mockOpenSetup).toHaveBeenCalled();
    expect(mockOpenZoneSelection).not.toHaveBeenCalled();
  });

  it('requires confirmation before deleting idle loaded plants', () => {
    mockState.selectedZone = { id: 'zone-1', name: 'Talhao 1' };
    mockState.selectedZonePlants = sprayingAggregateFixture.plants;

    render(<SprayingScreen />);

    fireEvent.press(screen.getByLabelText('Excluir estado local de pulverização'));
    expect(mockDeleteActiveOperation).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('confirm-delete'));
    expect(mockDeleteActiveOperation).toHaveBeenCalled();
  });

  it.each([
    ['draft', 'Iniciar GPS', mockStartTracking],
    ['tracking', 'Finalizar rota', mockFinishTracking],
    ['finished', 'Simular', mockSimulate],
    ['simulated', 'Confirmar revisão', mockConfirmReview],
    ['reviewed', 'Sincronizar', mockSyncOperation],
    ['sync_error', 'Sincronizar', mockSyncOperation],
  ] as const)('shows the correct action for %s', (status, label, action) => {
    mockState.aggregate = {
      ...sprayingAggregateFixture,
      operation: { ...sprayingAggregateFixture.operation, lifecycle_status: status },
    };

    render(<SprayingScreen />);

    expect(screen.getByTestId('spraying-action-bar')).toHaveStyle({ backgroundColor: 'transparent' });
    fireEvent.press(screen.getByText(label));
    expect(action).toHaveBeenCalled();
  });

  it('offers GPS recovery for interrupted tracking', () => {
    mockState.aggregate = {
      ...sprayingAggregateFixture,
      operation: { ...sprayingAggregateFixture.operation, lifecycle_status: 'tracking' },
    };
    mockState.trackingState = 'recovery_required';

    render(<SprayingScreen />);

    expect(screen.getByText('Retomar GPS')).toBeOnTheScreen();
    expect(screen.getByText(/tarefa GPS precisa ser retomada/)).toBeOnTheScreen();
  });

  it('explains map-based review when plants were simulated', () => {
    mockState.aggregate = {
      ...sprayingAggregateFixture,
      operation: { ...sprayingAggregateFixture.operation, lifecycle_status: 'simulated' },
    };

    render(<SprayingScreen />);

    expect(screen.getByText(/Plantas em laranja/)).toBeOnTheScreen();
    expect(screen.getByText('Confirmar revisão')).toBeOnTheScreen();
  });

  it('requires confirmation before deleting an active operation', () => {
    mockState.aggregate = {
      ...sprayingAggregateFixture,
      operation: { ...sprayingAggregateFixture.operation, lifecycle_status: 'draft' },
    };

    render(<SprayingScreen />);

    fireEvent.press(screen.getByLabelText('Excluir estado local de pulverização'));
    expect(mockDeleteActiveOperation).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('confirm-delete'));
    expect(mockDeleteActiveOperation).toHaveBeenCalled();
  });
});
