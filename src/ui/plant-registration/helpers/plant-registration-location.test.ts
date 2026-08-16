import type { LocationObject, LocationPermissionResponse } from 'expo-location';
import {
  hasPreciseLocationPermission,
  isPlantRegistrationLocationAccepted,
  selectBestPlantRegistrationLocation,
} from './plant-registration-location';

const now = 1_700_000_000_000;

function location(accuracy: number, timestamp = now, latitude = -23.5): LocationObject {
  return {
    coords: {
      accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      latitude,
      longitude: -46.6,
      speed: null,
    },
    timestamp,
  };
}

function permission(details: Partial<LocationPermissionResponse>): LocationPermissionResponse {
  return {
    canAskAgain: true,
    expires: 'never',
    granted: true,
    status: 'granted',
    ...details,
  } as LocationPermissionResponse;
}

describe('plant registration location', () => {
  it('requires fine Android location permission when Android reports its precision', () => {
    expect(hasPreciseLocationPermission(permission({ android: { accuracy: 'fine' } }))).toBe(true);
    expect(hasPreciseLocationPermission(permission({ android: { accuracy: 'coarse' } }))).toBe(false);
    expect(hasPreciseLocationPermission(permission({ ios: { scope: 'whenInUse' } }))).toBe(true);
    expect(hasPreciseLocationPermission(permission({ granted: false }))).toBe(false);
  });

  it('accepts only recent coordinates with at most five meters of uncertainty', () => {
    expect(isPlantRegistrationLocationAccepted(location(5), now)).toBe(true);
    expect(isPlantRegistrationLocationAccepted(location(5.1), now)).toBe(false);
    expect(isPlantRegistrationLocationAccepted(location(3, now - 10_001), now)).toBe(false);
    expect(isPlantRegistrationLocationAccepted(location(3, now, 91), now)).toBe(false);
  });

  it('keeps a more precise recent fix and replaces it when it becomes old', () => {
    const precise = location(2, now - 2_000);
    const lessPrecise = location(4, now);
    const newerAfterMovement = location(4, now + 5_000, -23.5001);

    expect(selectBestPlantRegistrationLocation(precise, lessPrecise, now)).toBe(precise);
    expect(selectBestPlantRegistrationLocation(precise, newerAfterMovement, now + 5_000)).toBe(newerAfterMovement);
  });
});
