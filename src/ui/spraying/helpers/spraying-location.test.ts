import { isSprayingLocationAccepted } from './spraying-location';
import type { LocationObject } from 'expo-location';

function createLocation(overrides: Partial<LocationObject['coords']> = {}, timestamp = 1_000): LocationObject {
  return {
    coords: {
      latitude: -23,
      longitude: -49,
      altitude: null,
      accuracy: 2,
      altitudeAccuracy: null,
      heading: null,
      speed: 1,
      ...overrides,
    },
    timestamp,
  };
}

describe('spraying location acceptance', () => {
  it('accepts a valid first point', () => {
    expect(isSprayingLocationAccepted(createLocation(), null, { now: 1_000 })).toBe(true);
  });

  it('rejects invalid, stale, inaccurate, duplicate, and implausible points', () => {
    expect(isSprayingLocationAccepted(createLocation({ latitude: 100 }), null, { now: 1_000 })).toBe(false);
    expect(isSprayingLocationAccepted(createLocation({ accuracy: 50 }), null, { now: 1_000 })).toBe(false);
    expect(isSprayingLocationAccepted(createLocation({}, 1_000), null, { now: 20_000 })).toBe(false);

    const previous = { latitude: -23, longitude: -49, timestamp: 1_000 };
    expect(isSprayingLocationAccepted(createLocation({}, 2_000), previous, { now: 2_000 })).toBe(false);
    expect(isSprayingLocationAccepted(createLocation({ longitude: -48.99 }, 2_000), previous, { now: 2_000 })).toBe(
      false,
    );
  });
});
