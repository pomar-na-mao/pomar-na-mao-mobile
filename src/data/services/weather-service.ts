import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import type { WeatherData } from '@/domain/models/weather.model';
import { weatherRepository } from '../repositories/weather/weather-repository';

const WEATHER_CACHE_KEY = '@pomar-na-mao/weather-data';

interface FullWeatherData {
  weather: WeatherData;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

class WeatherService {
  async getFullWeatherData(): Promise<FullWeatherData> {
    const hasInternet = await this.hasInternetConnection();

    if (!hasInternet) {
      const cachedData = await this.getCachedWeatherData();
      if (cachedData) return cachedData;

      throw new Error('Sem internet e sem dados meteorológicos salvos');
    }

    try {
      const data = await this.fetchFullWeatherData();
      await this.saveWeatherData(data);

      return data;
    } catch (error) {
      const cachedData = await this.getCachedWeatherData();
      if (cachedData) return cachedData;

      throw error;
    }
  }

  private async fetchFullWeatherData(): Promise<FullWeatherData> {
    const location = await weatherRepository.getCurrentLocation();
    const address = await weatherRepository.getAddressFromCoords(location.latitude, location.longitude);
    const rawData = await weatherRepository.getWeatherData(location.latitude, location.longitude);

    if (rawData && rawData.current) {
      const weather: WeatherData = {
        temperature: Math.round(rawData.current.temperature_2m),
        humidity: Math.round(rawData.current.relative_humidity_2m),
        windSpeed: Math.round(rawData.current.wind_speed_10m),
        precipitation: rawData.current.precipitation || 0,
        uvIndex: rawData.current.uv_index,
        weatherCode: rawData.current.weather_code,
        weatherDescription: this.getWeatherDescription(rawData.current.weather_code),
      };

      return {
        weather,
        location: {
          ...location,
          address,
        },
      };
    }

    throw new Error('Dados meteorológicos indisponíveis');
  }

  private async hasInternetConnection(): Promise<boolean> {
    const networkState = await Network.getNetworkStateAsync().catch(() => null);
    if (!networkState) return false;

    return Boolean(networkState.isConnected && networkState.isInternetReachable !== false);
  }

  private async saveWeatherData(data: FullWeatherData): Promise<void> {
    await AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data));
  }

  private async getCachedWeatherData(): Promise<FullWeatherData | null> {
    const storedData = await AsyncStorage.getItem(WEATHER_CACHE_KEY);
    if (!storedData) return null;

    try {
      return JSON.parse(storedData) as FullWeatherData;
    } catch {
      await AsyncStorage.removeItem(WEATHER_CACHE_KEY);
      return null;
    }
  }

  getWeatherDescription(code: number): string {
    switch (code) {
      case 0:
        return 'Céu limpo';
      case 1:
      case 2:
      case 3:
        return 'Parcial. nublado';
      case 45:
      case 48:
        return 'Neblina';
      case 51:
      case 53:
      case 55:
        return 'Garoa';
      case 61:
      case 63:
      case 65:
        return 'Chuva';
      case 71:
      case 73:
      case 75:
        return 'Neve';
      case 95:
      case 96:
      case 99:
        return 'Tempestade';
      default:
        return '';
    }
  }

  getUvText(uv: number): string {
    if (uv <= 2) return 'Baixo';
    if (uv <= 5) return 'Mod.';
    if (uv <= 7) return 'Alto';
    if (uv <= 10) return 'M. Alto';
    return 'Extremo';
  }
}

export const weatherService = new WeatherService();
