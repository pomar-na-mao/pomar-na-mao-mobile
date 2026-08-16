import type { LocalSprayingTrackPoint } from '@/domain/models/spraying';
import {
  HIGH_ACCURACY_MAX_HORIZONTAL_ERROR_METERS,
  HIGH_ACCURACY_MAX_LOCATION_AGE_MS,
  isHighAccuracyLocationAccepted,
} from '@/shared/helpers/high-accuracy-location';
import { twoPointsDistance } from '@/utils/geolocation/geolocation-math';
import type { LocationObject } from 'expo-location';

export const SPRAYING_MAX_ACCURACY_METERS = HIGH_ACCURACY_MAX_HORIZONTAL_ERROR_METERS;
export const SPRAYING_MAX_LOCATION_AGE_MS = HIGH_ACCURACY_MAX_LOCATION_AGE_MS;
export const SPRAYING_MIN_POINT_DISTANCE_METERS = 0.75;
export const SPRAYING_MAX_PLAUSIBLE_SPEED_MPS = 15;

export interface AcceptedSprayingLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface SprayingLocationValidationOptions {
  now?: number;
  maxAccuracyMeters?: number;
  maxAgeMs?: number;
  minPointDistanceMeters?: number;
  maxPlausibleSpeedMps?: number;
}

export function isSprayingLocationAccepted(
  location: LocationObject,
  previous: AcceptedSprayingLocation | null,
  options: SprayingLocationValidationOptions = {},
): boolean {
  const latitude = location.coords.latitude;
  const longitude = location.coords.longitude;
  const timestamp = location.timestamp;
  const now = options.now ?? Date.now();

  if (
    !isHighAccuracyLocationAccepted(location, {
      maxAccuracyMeters: options.maxAccuracyMeters,
      maxAgeMs: options.maxAgeMs,
      now,
    })
  ) {
    return false;
  }

  if (!previous) {
    return true;
  }

  const distanceMeters = twoPointsDistance(previous, { latitude, longitude });
  if (distanceMeters < (options.minPointDistanceMeters ?? SPRAYING_MIN_POINT_DISTANCE_METERS)) {
    return false;
  }

  const elapsedSeconds = (timestamp - previous.timestamp) / 1000;
  if (elapsedSeconds <= 0) {
    return false;
  }

  return distanceMeters / elapsedSeconds <= (options.maxPlausibleSpeedMps ?? SPRAYING_MAX_PLAUSIBLE_SPEED_MPS);
}

export function trackPointToAcceptedLocation(point: LocalSprayingTrackPoint): AcceptedSprayingLocation {
  return {
    latitude: point.latitude,
    longitude: point.longitude,
    timestamp: new Date(point.recorded_at).getTime(),
  };
}
