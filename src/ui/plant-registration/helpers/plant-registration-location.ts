import {
  hasPreciseLocationPermission,
  HIGH_ACCURACY_MAX_HORIZONTAL_ERROR_METERS,
  HIGH_ACCURACY_MAX_LOCATION_AGE_MS,
  isHighAccuracyLocationAccepted,
} from '@/shared/helpers/high-accuracy-location';
import type { LocationObject } from 'expo-location';

export const PLANT_REGISTRATION_MAX_ACCURACY_METERS = HIGH_ACCURACY_MAX_HORIZONTAL_ERROR_METERS;
export const PLANT_REGISTRATION_MAX_LOCATION_AGE_MS = HIGH_ACCURACY_MAX_LOCATION_AGE_MS;
export { hasPreciseLocationPermission };

export function isPlantRegistrationLocationAccepted(location: LocationObject, now = Date.now()): boolean {
  return isHighAccuracyLocationAccepted(location, { now });
}

export function selectBestPlantRegistrationLocation(
  current: LocationObject | null,
  candidate: LocationObject,
  now = Date.now(),
): LocationObject | null {
  if (!isPlantRegistrationLocationAccepted(candidate, now)) return current;
  if (!current || !isPlantRegistrationLocationAccepted(current, now)) return candidate;

  const currentAccuracy = current.coords.accuracy ?? Number.POSITIVE_INFINITY;
  const candidateAccuracy = candidate.coords.accuracy ?? Number.POSITIVE_INFINITY;
  const candidateIsMeaningfullyNewer = candidate.timestamp - current.timestamp >= 5_000;

  return candidateAccuracy <= currentAccuracy || candidateIsMeaningfullyNewer ? candidate : current;
}
