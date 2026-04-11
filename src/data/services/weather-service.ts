import { weatherRepository } from '../repositories/weather/weather-repository';
import type { WeatherData } from '@/domain/models/weather.model';

class WeatherService {
  async getFullWeatherData() {
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
