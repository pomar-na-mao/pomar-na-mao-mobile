import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { WeatherCard } from '.';
import { useWeather } from './view-models/use-weather';

jest.mock('@/shared/hooks/use-color-scheme.web', () => ({ useColorScheme: () => 'light' }));
jest.mock('./view-models/use-weather', () => ({ useWeather: jest.fn() }));

const mockedUseWeather = jest.mocked(useWeather);

describe('WeatherCard', () => {
  it('does not render an offline error message when weather is unavailable', () => {
    mockedUseWeather.mockReturnValue({
      error: 'Sem internet e sem dados meteorológicos salvos',
      getUvText: jest.fn(),
      isLoading: false,
      location: null,
      refreshWeather: jest.fn(),
      weather: null,
    });

    render(<WeatherCard />);

    expect(screen.queryByText(/Sem internet|Erro de localização/i)).toBeNull();
  });
});
