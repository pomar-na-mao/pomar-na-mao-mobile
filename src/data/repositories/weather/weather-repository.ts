/* eslint-disable max-len */
import * as Location from 'expo-location';
import type { LocationData } from '@/domain/models/weather.model';

class WeatherRepository {
  async getCurrentLocation(): Promise<LocationData> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Acesso à localização negado');
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }

  async getAddressFromCoords(lat: number, lon: number): Promise<string> {
    try {
      const address = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (address && address.length > 0) {
        const city = address[0].city || address[0].subregion || address[0].district;
        const state = address[0].region;
        if (city && state) return `${city.toUpperCase()} • ${state.toUpperCase()}`;
        if (city) return city.toUpperCase();
      }
    } catch (error) {
      console.error('Error reverse geocoding', error);
    }
    return 'LOCAL DESCONHECIDO';
  }

  async getWeatherData(lat: number, lon: number) {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,uv_index&timezone=auto`,
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar dados meteorológicos');
    }

    return await response.json();
  }
}

export const weatherRepository = new WeatherRepository();
