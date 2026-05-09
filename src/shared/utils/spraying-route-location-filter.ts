import type { LocationObject } from 'expo-location';
import { twoPointsDistance, type Point } from '@/utils/geolocation/geolocation-math';

export const MAX_ACCEPTABLE_ACCURACY_METERS = 25;
export const MAX_LOCATION_AGE_MS = 15_000;
export const MAX_WALKING_SPEED_METERS_PER_SECOND = 5;
export const MIN_JUMP_DISTANCE_METERS = 10;

export interface AcceptedRouteLocation {
  point: Point;
  timestamp: number;
}

export function getRoutePointFromLocation(location: LocationObject): Point {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

function hasValidCoordinates(location: LocationObject): boolean {
  const { latitude, longitude } = location.coords;

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function shouldAcceptSprayingRouteLocation(
  location: LocationObject,
  lastAcceptedLocation: AcceptedRouteLocation | null,
): boolean {
  if (!hasValidCoordinates(location)) {
    return false;
  }

  const accuracy = location.coords.accuracy;
  if (accuracy == null || accuracy > MAX_ACCEPTABLE_ACCURACY_METERS) {
    return false;
  }

  const timestamp = location.timestamp || Date.now();
  if (Date.now() - timestamp > MAX_LOCATION_AGE_MS) {
    return false;
  }

  if (!lastAcceptedLocation) {
    return true;
  }

  const point = getRoutePointFromLocation(location);
  const distanceMeters = twoPointsDistance(lastAcceptedLocation.point, point);
  const elapsedSeconds = Math.max((timestamp - lastAcceptedLocation.timestamp) / 1000, 1);
  const speedMetersPerSecond = distanceMeters / elapsedSeconds;

  return distanceMeters <= MIN_JUMP_DISTANCE_METERS || speedMetersPerSecond <= MAX_WALKING_SPEED_METERS_PER_SECOND;
}
