import type { MagnetometerMeasurement } from 'expo-sensors';

const FULL_CIRCLE_DEGREES = 360;
export const MIN_RELIABLE_WALKING_SPEED_MPS = 0.45;

export interface StabilizeHeadingOptions {
  jitterThresholdDegrees: number;
  smoothingFactor: number;
}

export type HeadingSource = 'movement' | 'sensor' | 'location' | null;

export interface SelectHeadingOptions {
  headingOffsetDegrees?: number;
  locationHeadingDegrees?: number | null;
  locationSpeedMetersPerSecond?: number | null;
  sensorHeadingDegrees?: number | null;
  walkingSpeedThresholdMetersPerSecond?: number;
}

export interface SelectedHeading {
  headingDegrees: number | null;
  source: HeadingSource;
}

export function normalizeHeadingDegrees(headingDegrees: number): number {
  return ((headingDegrees % FULL_CIRCLE_DEGREES) + FULL_CIRCLE_DEGREES) % FULL_CIRCLE_DEGREES;
}

export function isValidHeadingDegrees(headingDegrees: number | null | undefined): headingDegrees is number {
  return typeof headingDegrees === 'number' && Number.isFinite(headingDegrees) && headingDegrees >= 0;
}

export function isReliableWalkingSpeed(
  speedMetersPerSecond: number | null | undefined,
  thresholdMetersPerSecond = MIN_RELIABLE_WALKING_SPEED_MPS,
): boolean {
  return (
    typeof speedMetersPerSecond === 'number' &&
    Number.isFinite(speedMetersPerSecond) &&
    speedMetersPerSecond >= thresholdMetersPerSecond
  );
}

export function getShortestHeadingDelta(fromDegrees: number, toDegrees: number): number {
  const from = normalizeHeadingDegrees(fromDegrees);
  const to = normalizeHeadingDegrees(toDegrees);

  return ((to - from + 540) % FULL_CIRCLE_DEGREES) - 180;
}

export function stabilizeHeadingDegrees(
  previousHeadingDegrees: number | null,
  nextHeadingDegrees: number,
  options: StabilizeHeadingOptions,
): number {
  const next = normalizeHeadingDegrees(nextHeadingDegrees);

  if (previousHeadingDegrees === null) {
    return next;
  }

  const previous = normalizeHeadingDegrees(previousHeadingDegrees);
  const delta = getShortestHeadingDelta(previous, next);

  if (Math.abs(delta) < options.jitterThresholdDegrees) {
    return previous;
  }

  return normalizeHeadingDegrees(previous + delta * options.smoothingFactor);
}

export function applyHeadingOffset(headingDegrees: number, offsetDegrees = 0): number {
  return normalizeHeadingDegrees(headingDegrees + offsetDegrees);
}

export function selectUserHeadingDegrees({
  headingOffsetDegrees = 0,
  locationHeadingDegrees,
  locationSpeedMetersPerSecond,
  sensorHeadingDegrees,
  walkingSpeedThresholdMetersPerSecond = MIN_RELIABLE_WALKING_SPEED_MPS,
}: SelectHeadingOptions): SelectedHeading {
  if (
    isReliableWalkingSpeed(locationSpeedMetersPerSecond, walkingSpeedThresholdMetersPerSecond) &&
    isValidHeadingDegrees(locationHeadingDegrees)
  ) {
    return {
      headingDegrees: applyHeadingOffset(locationHeadingDegrees, headingOffsetDegrees),
      source: 'movement',
    };
  }

  if (isValidHeadingDegrees(sensorHeadingDegrees)) {
    return {
      headingDegrees: applyHeadingOffset(sensorHeadingDegrees, headingOffsetDegrees),
      source: 'sensor',
    };
  }

  if (isValidHeadingDegrees(locationHeadingDegrees)) {
    return {
      headingDegrees: applyHeadingOffset(locationHeadingDegrees, headingOffsetDegrees),
      source: 'location',
    };
  }

  return {
    headingDegrees: null,
    source: null,
  };
}

export function getMagnetometerHeadingDegrees(measurement: MagnetometerMeasurement): number | null {
  const { x, y } = measurement;

  if (!Number.isFinite(x) || !Number.isFinite(y) || (x === 0 && y === 0)) {
    return null;
  }

  const magneticNorthAngleFromDeviceRight = Math.atan2(y, x) * (180 / Math.PI);

  return normalizeHeadingDegrees(magneticNorthAngleFromDeviceRight - 90);
}
