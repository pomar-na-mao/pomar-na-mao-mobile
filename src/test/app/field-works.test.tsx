import FieldWorks from '@/app/field-works';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/ui/shared/components/weather-card', () => ({
  WeatherCard: () => null,
}));

describe('FieldWorks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes inspection and annotation while retired routes stay hidden', () => {
    render(<FieldWorks />);

    expect(screen.getByText('Inspeção')).toBeOnTheScreen();
    expect(screen.getByText('Anotação')).toBeOnTheScreen();
    expect(screen.queryByText(/Pulver/)).toBeNull();
    expect(screen.queryByText(/Adicionar planta/)).toBeNull();

    fireEvent.press(screen.getByText('Anotação'));
    expect(mockPush).toHaveBeenCalledWith('/annotation');
  });
});
