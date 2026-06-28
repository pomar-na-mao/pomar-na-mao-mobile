import FieldWorks from '@/app/field-works';
import type { FieldWorkCardId, FieldWorkCardState } from '@/ui/shared/hooks/use-field-work-data';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

const mockPush = jest.fn();
const mockUseFieldWorkDataReadiness = jest.fn<Record<FieldWorkCardId, FieldWorkCardState>, []>();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/ui/shared/components/weather-card', () => ({
  WeatherCard: () => null,
}));

jest.mock('@/ui/shared/hooks/use-field-work-data', () => ({
  useFieldWorkDataReadiness: () => mockUseFieldWorkDataReadiness(),
}));

describe('FieldWorks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('keeps loading cards disabled and shows progress without the unavailable icon', () => {
    mockUseFieldWorkDataReadiness.mockReturnValue({
      annotation: 'loading',
      inspection: 'loading',
      spraying: 'loading',
    });

    render(<FieldWorks />);

    expect(screen.getByTestId('field-work-card-inspection')).toBeDisabled();
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
    expect(screen.getByLabelText(/Inspeção indisponível.*Sem conexão/)).toBeOnTheScreen();

    fireEvent.press(inspectionCard);
    expect(mockPush).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('field-work-card-spraying'));
    expect(mockPush).toHaveBeenCalledWith('/spraying');
  });

  it('disables every card when readiness reports an offline state', () => {
    mockUseFieldWorkDataReadiness.mockReturnValue({
      annotation: 'unavailable',
      inspection: 'unavailable',
      spraying: 'unavailable',
    });

    render(<FieldWorks />);

    expect(screen.getByTestId('field-work-card-inspection')).toBeDisabled();
    expect(screen.getByTestId('field-work-card-annotation')).toBeDisabled();
    expect(screen.getByTestId('field-work-card-spraying')).toBeDisabled();
    expect(screen.getAllByLabelText(/indisponível.*Sem conexão/)).toHaveLength(3);
  });
});
