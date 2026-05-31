import {
  getMagnetometerHeadingDegrees,
  type HeadingSource,
  selectUserHeadingDegrees,
  stabilizeHeadingDegrees,
} from '@/utils/geolocation/heading';
import { Magnetometer } from 'expo-sensors';
import { useEffect, useMemo, useState } from 'react';

const MAGNETOMETER_UPDATE_INTERVAL_MS = 120;
const HEADING_JITTER_THRESHOLD_DEGREES = 2;
const HEADING_SMOOTHING_FACTOR = 0.24;

export interface DeviceHeading {
  headingDegrees: number | null;
  source: HeadingSource;
}

interface UseDeviceHeadingParams {
  headingOffsetDegrees?: number;
  locationHeadingDegrees?: number | null;
  locationSpeedMetersPerSecond?: number | null;
}

export function useDeviceHeading({
  headingOffsetDegrees = 0,
  locationHeadingDegrees,
  locationSpeedMetersPerSecond,
}: UseDeviceHeadingParams): DeviceHeading {
  const [sensorHeadingDegrees, setSensorHeadingDegrees] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    let subscription: { remove: () => void } | null = null;

    async function subscribe() {
      try {
        const isAvailable = await Magnetometer.isAvailableAsync();

        if (!isAvailable || !isMounted) {
          return;
        }

        const currentPermission = await Magnetometer.getPermissionsAsync();
        let isGranted = currentPermission.granted;

        if (!isGranted && currentPermission.canAskAgain) {
          const requestedPermission = await Magnetometer.requestPermissionsAsync();
          isGranted = requestedPermission.granted;
        }

        if (!isGranted || !isMounted) {
          return;
        }

        Magnetometer.setUpdateInterval(MAGNETOMETER_UPDATE_INTERVAL_MS);
        subscription = Magnetometer.addListener((measurement) => {
          const nextHeading = getMagnetometerHeadingDegrees(measurement);

          if (nextHeading === null) {
            return;
          }

          setSensorHeadingDegrees((previousHeading) =>
            stabilizeHeadingDegrees(previousHeading, nextHeading, {
              jitterThresholdDegrees: HEADING_JITTER_THRESHOLD_DEGREES,
              smoothingFactor: HEADING_SMOOTHING_FACTOR,
            }),
          );
        });
      } catch {
        setSensorHeadingDegrees(null);
      }
    }

    subscribe();

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  return useMemo(() => {
    return selectUserHeadingDegrees({
      headingOffsetDegrees,
      locationHeadingDegrees,
      locationSpeedMetersPerSecond,
      sensorHeadingDegrees,
    });
  }, [headingOffsetDegrees, locationHeadingDegrees, locationSpeedMetersPerSecond, sensorHeadingDegrees]);
}
