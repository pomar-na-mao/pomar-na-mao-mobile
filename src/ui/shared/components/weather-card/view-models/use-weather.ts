import { weatherService } from '@/data/services/weather-service';
import type { LocationData, WeatherData } from '@/domain/models/weather.model';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useEffect, useState } from 'react';

export const useWeather = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { setMessage, setIsVisible } = useAlertBoxStore();

  const fetchWeather = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await weatherService.getFullWeatherData();
      setWeather(data.weather);
      setLocation(data.location);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar dados do tempo!');
      setMessage('Erro ao carregar dados do tempo!.\n' + error);
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (mounted) await fetchWeather();
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    isLoading,
    weather,
    location,
    error,
    refreshWeather: fetchWeather,
    getUvText: weatherService.getUvText,
  };
};
