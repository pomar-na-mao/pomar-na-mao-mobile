import type { LocationObject, LocationPermissionResponse } from 'expo-location';

export const HIGH_ACCURACY_MAX_HORIZONTAL_ERROR_METERS = 5;
export const HIGH_ACCURACY_MAX_LOCATION_AGE_MS = 10_000;
export const HIGH_ACCURACY_LOCATION_DISTANCE_INTERVAL_METERS = 0;
export const HIGH_ACCURACY_LOCATION_TIME_INTERVAL_MS = 1_000;

interface HighAccuracyLocationValidationOptions {
  now?: number;
  maxAccuracyMeters?: number;
  maxAgeMs?: number;
}

export function hasPreciseLocationPermission(permission: LocationPermissionResponse): boolean {
  if (!permission.granted) return false;
  if (permission.android?.accuracy && permission.android.accuracy !== 'fine') return false;
  return true;
}

export function isHighAccuracyLocationAccepted(
  location: LocationObject,
  options: HighAccuracyLocationValidationOptions = {},
): boolean {
  const { accuracy, latitude, longitude } = location.coords;
  const now = options.now ?? Date.now();
  const ageMs = now - location.timestamp;

  return (
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    accuracy != null &&
    accuracy >= 0 &&
    accuracy <= (options.maxAccuracyMeters ?? HIGH_ACCURACY_MAX_HORIZONTAL_ERROR_METERS) &&
    ageMs >= -1_000 &&
    ageMs <= (options.maxAgeMs ?? HIGH_ACCURACY_MAX_LOCATION_AGE_MS)
  );
}
