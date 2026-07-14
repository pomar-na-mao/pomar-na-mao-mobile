import { weatherService } from '@/data/services/weather-service';
import { renderHook, waitFor } from '@testing-library/react-native';
import * as Network from 'expo-network';
import { useWeather } from './use-weather';

jest.mock('expo-network', () => ({ useNetworkState: jest.fn() }));
jest.mock('@/data/services/weather-service', () => ({
  weatherService: {
    getFullWeatherData: jest.fn(),
    getUvText: jest.fn(),
  },
}));

const mockedNetwork = jest.mocked(Network);
const mockedWeatherService = jest.mocked(weatherService);

const onlineWeather = {
  location: { address: 'Pomar', latitude: -23, longitude: -49 },
  weather: {
    humidity: 70,
    precipitation: 0,
    temperature: 24,
    uvIndex: 3,
    weatherCode: 0,
    weatherDescription: 'Céu limpo',
    windSpeed: 8,
  },
};

describe('useWeather', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('silently retries and updates weather when connectivity returns', async () => {
    mockedNetwork.useNetworkState.mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
    });
    mockedWeatherService.getFullWeatherData
      .mockRejectedValueOnce(new Error('Sem internet e sem dados meteorológicos salvos'))
      .mockResolvedValueOnce(onlineWeather);

    const { rerender, result } = renderHook(() => useWeather());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.weather).toBeNull();
    expect(mockedWeatherService.getFullWeatherData).toHaveBeenCalledTimes(1);

    mockedNetwork.useNetworkState.mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
    });
    rerender(undefined);

    await waitFor(() => expect(result.current.weather).toEqual(onlineWeather.weather));
    expect(result.current.location).toEqual(onlineWeather.location);
    expect(result.current.error).toBeNull();
    expect(mockedWeatherService.getFullWeatherData).toHaveBeenCalledTimes(2);
  });
});
