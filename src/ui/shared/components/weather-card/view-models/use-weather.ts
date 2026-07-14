import { weatherService } from '@/data/services/weather-service';
import type { LocationData, WeatherData } from '@/domain/models/weather.model';
import * as Network from 'expo-network';
import { useCallback, useEffect, useRef, useState } from 'react';

type WeatherNetworkState = 'loading' | 'offline' | 'online';

function getWeatherNetworkState(networkState: Network.NetworkState): WeatherNetworkState {
  if (networkState.isConnected === false || networkState.isInternetReachable === false) {
    return 'offline';
  }
  if (networkState.isConnected === undefined || networkState.isInternetReachable === undefined) {
    return 'loading';
  }
  return 'online';
}

export const useWeather = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const networkState = Network.useNetworkState();
  const connection = getWeatherNetworkState(networkState);

  const fetchWeather = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    try {
      setIsLoading(true);
      setError(null);
      const data = await weatherService.getFullWeatherData();

      if (currentRequestId !== requestId.current) return;
      setWeather(data.weather);
      setLocation(data.location);
    } catch (caughtError) {
      if (currentRequestId !== requestId.current) return;
      setError(caughtError instanceof Error ? caughtError.message : 'Erro ao carregar dados do tempo!');
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (connection === 'loading') return;

    void fetchWeather();

    return () => {
      requestId.current += 1;
    };
  }, [connection, fetchWeather]);

  return {
    isLoading,
    weather,
    location,
    error,
    refreshWeather: fetchWeather,
    getUvText: weatherService.getUvText,
  };
};
