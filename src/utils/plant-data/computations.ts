import type { PlantData } from '@/domain/models/shared/plant-data.model';
import { twoPointsDistance, type Point } from '@/utils/geolocation/geolocation-math';
import * as Location from 'expo-location';

export const updateDistanceBetweenUserAndNearestPlant = (
  nearestPlant: PlantData | null,
  location: Location.LocationObject,
): number | null => {
  let distance = null;
  if (nearestPlant && location) {
    const plantLocation = {
      latitude: nearestPlant.latitude as number,
      longitude: nearestPlant.longitude as number,
    } as Point;

    const userLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    } as Point;

    distance = twoPointsDistance(userLocation, plantLocation);
  }

  return distance;
};

export const formatDistance = (distance: number): string => {
  return distance < 1000 ? `${distance.toFixed(3)}m` : `${(distance / 1000).toFixed(2)}km`;
};
