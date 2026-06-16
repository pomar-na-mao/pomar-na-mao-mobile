import type { LocationObject } from 'expo-location';
import type { LatLng } from 'react-native-maps';

export function createSimulationLocation(coordinate: LatLng, timestamp: number): LocationObject {
  return {
    coords: {
      accuracy: 1,
      altitude: 0,
      altitudeAccuracy: 1,
      heading: null,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      speed: 0,
    },
    timestamp,
  };
}
