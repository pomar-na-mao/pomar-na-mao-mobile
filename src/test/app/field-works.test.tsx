import FieldWorks from '@/app/field-works';
import type { FieldWorkCardId, FieldWorkCardState } from '@/ui/shared/hooks/use-field-work-data';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

const mockPush = jest.fn();
const mockOpenPlantLoader = jest.fn();
const mockClearAllPlants = jest.fn().mockResolvedValue(undefined);
const mockClearZonePlants = jest.fn().mockResolvedValue(undefined);
let mockLoadedZones: { id: string; loadedAt: string; name: string; plantCount: number }[] = [];
const mockUseFieldWorkDataReadiness = jest.fn<Record<FieldWorkCardId, FieldWorkCardState>, []>();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/ui/shared/components/field-work-plant-load-modal', () => ({
  FieldWorkPlantLoadModal: () => null,
}));

jest.mock('@/ui/shared/hooks/use-field-work-plant-loader', () => ({
  useFieldWorkPlantLoader: () => ({
    clearAllPlants: mockClearAllPlants,
    clearZonePlants: mockClearZonePlants,
    close: jest.fn(),
    error: null,
    isLoading: false,
    isOnline: true,
    isVisible: false,
    loadZone: jest.fn(),
    loadedZones: mockLoadedZones,
    open: mockOpenPlantLoader,
    totalPlants: 0,
    zones: [],
  }),
}));

jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => ({
  __esModule: true,
  default: ({ children, renderLeftActions }: { children: React.ReactNode; renderLeftActions?: Function }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    const swipeable = { close: jest.fn() };
    return (
      <View>
        {renderLeftActions?.(null, null, swipeable)}
        {children}
      </View>
    );
  },
}));

jest.mock('react-native-gesture-handler', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pressable } = require('react-native');
  return {
    RectButton: ({ children, ...props }: { children: React.ReactNode }) => <Pressable {...props}>{children}</Pressable>,
  };
});

jest.mock('@/ui/shared/hooks/use-field-work-data', () => ({
  useFieldWorkDataReadiness: () => mockUseFieldWorkDataReadiness(),
}));

describe('FieldWorks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadedZones = [];
    mockUseFieldWorkDataReadiness.mockReturnValue({
      annotation: 'ready',
      inspection: 'ready',
      spraying: 'ready',
    });
  });

  it('exposes inspection, annotation and spraying while add-plant stays hidden', () => {
    render(<FieldWorks />);

    expect(screen.getByText('Inspeção')).toBeOnTheScreen();
    expect(screen.getByText('Anotação')).toBeOnTheScreen();
    expect(screen.getByText('Pulverização')).toBeOnTheScreen();
    expect(screen.queryByText(/Adicionar planta/)).toBeNull();

    fireEvent.press(screen.getByText('Pulverização'));
    expect(mockPush).toHaveBeenCalledWith('/spraying');
  });

  it('opens the shared plant loader from the loaded-data card', () => {
    render(<FieldWorks />);

    fireEvent.press(screen.getByTestId('field-work-load-plants-button'));
    expect(mockOpenPlantLoader).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Nenhuma planta carregada')).toBeOnTheScreen();
    expect(screen.getByText('Plantas necessárias')).toBeOnTheScreen();
    expect(screen.getByText(/Carregue plantas para liberar/)).toBeOnTheScreen();
    expect(screen.getByTestId('field-work-loaded-data-banner')).toBeOnTheScreen();
    expect(screen.queryByText(/plantas carregadas/)).toBeNull();
    expect(screen.queryByText('Carregar')).toBeNull();
  });

  it('shows the loaded plant count for each zone', () => {
    mockLoadedZones = [
      { id: 'zone-1', loadedAt: '2026-07-01', name: 'Talhão Norte', plantCount: 1 },
      { id: 'zone-2', loadedAt: '2026-07-01', name: 'Talhão Sul', plantCount: 24 },
    ];

    render(<FieldWorks />);

    expect(screen.getByText('Talhão Norte')).toBeOnTheScreen();
    expect(screen.getByText('1 planta')).toBeOnTheScreen();
    expect(screen.getByText('Talhão Sul')).toBeOnTheScreen();
    expect(screen.getByText('24 plantas')).toBeOnTheScreen();
    expect(screen.queryByTestId('field-work-loaded-data-banner')).not.toBeOnTheScreen();
    expect(screen.queryByText('Plantas necessárias')).not.toBeOnTheScreen();
    expect(screen.getByTestId('field-work-loaded-data-card')).toHaveStyle({ height: 280 });
    expect(screen.getByTestId('field-work-loaded-zones-scroll').props.nestedScrollEnabled).toBe(true);
  });

  it('keeps the loaded-data card height fixed when several zones are loaded', () => {
    mockLoadedZones = Array.from({ length: 8 }, (_, index) => ({
      id: `zone-${index}`,
      loadedAt: '2026-07-01',
      name: `TalhÃ£o ${index + 1}`,
      plantCount: index + 1,
    }));

    render(<FieldWorks />);

    expect(screen.getByTestId('field-work-loaded-data-card')).toHaveStyle({ height: 280 });
    expect(screen.getByTestId('field-work-loaded-zones-scroll')).toHaveProp('showsVerticalScrollIndicator', true);
  });

  it('confirms before deleting every loaded plant', async () => {
    mockLoadedZones = [{ id: 'zone-1', loadedAt: '2026-07-01', name: 'Talhão Norte', plantCount: 2 }];
    render(<FieldWorks />);

    fireEvent.press(screen.getByTestId('field-work-clear-plants-button'));
    expect(screen.getByTestId('field-work-clear-plants-modal')).toBeOnTheScreen();
    expect(screen.getByText('Excluir plantas carregadas?')).toBeOnTheScreen();
    await act(async () => {
      fireEvent.press(screen.getByText('Excluir'));
    });
    expect(mockClearAllPlants).toHaveBeenCalledTimes(1);
  });

  it('deletes only the zone revealed by the swipe action', async () => {
    mockLoadedZones = [
      { id: 'zone-1', loadedAt: '2026-07-01', name: 'Talhão Norte', plantCount: 2 },
      { id: 'zone-2', loadedAt: '2026-07-01', name: 'Talhão Sul', plantCount: 3 },
    ];
    render(<FieldWorks />);

    fireEvent.press(screen.getByTestId('field-work-remove-zone-zone-2'));
    expect(screen.getByText('Excluir plantas de Talhão Sul?')).toBeOnTheScreen();
    await act(async () => {
      fireEvent.press(screen.getByText('Excluir'));
    });

    expect(mockClearZonePlants).toHaveBeenCalledWith('zone-2');
    expect(mockClearAllPlants).not.toHaveBeenCalled();
  });

  it('keeps loading cards disabled and shows progress without the unavailable icon', () => {
    mockUseFieldWorkDataReadiness.mockReturnValue({
      annotation: 'loading',
      inspection: 'loading',
      spraying: 'loading',
    });

    render(<FieldWorks />);

    const inspectionCard = screen.getByTestId('field-work-card-inspection');
    expect(inspectionCard).toBeDisabled();
    expect(inspectionCard.props.onPress).toBeUndefined();
    expect(screen.getByLabelText(/Carregando dados de Inspeção/)).toBeOnTheScreen();
    expect(screen.queryByLabelText(/Inspeção indisponível/)).toBeNull();
  });

  it('disables only affected cards and renders an accessible unavailable indicator', () => {
    mockUseFieldWorkDataReadiness.mockReturnValue({
      annotation: 'unavailable',
      inspection: 'unavailable',
      spraying: 'ready',
    });

    render(<FieldWorks />);

    const inspectionCard = screen.getByTestId('field-work-card-inspection');
    expect(inspectionCard).toBeDisabled();
    expect(inspectionCard.props.onPress).toBeUndefined();
    expect(screen.getByLabelText(/Inspeção indisponível.*Sem conexão/)).toBeOnTheScreen();

    fireEvent.press(inspectionCard);
    expect(mockPush).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('field-work-card-spraying'));
    expect(mockPush).toHaveBeenCalledWith('/spraying');
  });

  it('disables every card when offline options are not cached', () => {
    mockUseFieldWorkDataReadiness.mockReturnValue({
      annotation: 'unavailable',
      inspection: 'unavailable',
      spraying: 'unavailable',
    });

    render(<FieldWorks />);

    expect(screen.getByTestId('field-work-card-inspection')).toBeDisabled();
    expect(screen.getByTestId('field-work-card-annotation')).toBeDisabled();
    expect(screen.getByTestId('field-work-card-spraying')).toBeDisabled();
    expect(screen.getByTestId('field-work-card-inspection').props.onPress).toBeUndefined();
    expect(screen.getByTestId('field-work-card-annotation').props.onPress).toBeUndefined();
    expect(screen.getByTestId('field-work-card-spraying').props.onPress).toBeUndefined();
    expect(screen.getAllByLabelText(/indisponível.*Sem conexão/)).toHaveLength(3);
  });
});
