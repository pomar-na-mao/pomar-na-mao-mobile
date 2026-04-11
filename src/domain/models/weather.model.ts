export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  uvIndex: number;
  weatherCode: number;
  weatherDescription: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface WeatherState {
  isLoading: boolean;
  weather: WeatherData | null;
  location: LocationData | null;
  error: string | null;
}
