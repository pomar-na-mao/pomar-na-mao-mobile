import { useDeviceHeading } from '@/shared/hooks/use-device-heading';
import { twoPointsDistance } from '@/utils/geolocation/geolocation-math';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker, type LatLng } from 'react-native-maps';

const MARKER_ANIMATION_DURATION_MS = 260;
const MARKER_SNAP_DISTANCE_METERS = 20;
const STALE_LOCATION_UPDATE_MS = 10_000;
const DEFAULT_HEADING_OFFSET_DEGREES = 0;

interface UserMarkerLocationProps {
  coordinate: LatLng;
  coordinateTimestamp?: number | null;
  headingDegrees: number | null;
  headingOffsetDegrees?: number;
  markerZIndex?: number;
  speedMetersPerSecond?: number | null;
}

export function UserMarkerLocation({
  coordinate,
  coordinateTimestamp = null,
  headingDegrees: locationHeadingDegrees,
  headingOffsetDegrees = DEFAULT_HEADING_OFFSET_DEGREES,
  markerZIndex = 999,
  speedMetersPerSecond = null,
}: UserMarkerLocationProps) {
  const lastCoordinateTimestampRef = useRef<number | null>(coordinateTimestamp);
  const animationFrameRef = useRef<number | null>(null);
  const displayCoordinateRef = useRef(coordinate);
  const [displayCoordinate, setDisplayCoordinate] = useState(coordinate);
  const { headingDegrees } = useDeviceHeading({
    headingOffsetDegrees,
    locationHeadingDegrees,
    locationSpeedMetersPerSecond: speedMetersPerSecond,
  });

  useEffect(() => {
    if (!Number.isFinite(coordinate.latitude) || !Number.isFinite(coordinate.longitude)) {
      return;
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const now = Date.now();
    const lastCoordinateTimestamp = lastCoordinateTimestampRef.current;
    const startCoordinate = displayCoordinateRef.current;
    const distanceMeters = twoPointsDistance(startCoordinate, coordinate);
    const isOutdatedUpdate =
      coordinateTimestamp !== null &&
      ((lastCoordinateTimestamp !== null && coordinateTimestamp < lastCoordinateTimestamp) ||
        now - coordinateTimestamp > STALE_LOCATION_UPDATE_MS);
    const shouldSnap = isOutdatedUpdate || distanceMeters > MARKER_SNAP_DISTANCE_METERS;

    lastCoordinateTimestampRef.current = coordinateTimestamp;

    if (shouldSnap || distanceMeters === 0) {
      displayCoordinateRef.current = coordinate;
      setDisplayCoordinate(coordinate);
      return;
    }

    const animationStartedAt = Date.now();
    const animate = () => {
      const progress = Math.min((Date.now() - animationStartedAt) / MARKER_ANIMATION_DURATION_MS, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 2);
      const nextCoordinate = {
        latitude: startCoordinate.latitude + (coordinate.latitude - startCoordinate.latitude) * easedProgress,
        longitude: startCoordinate.longitude + (coordinate.longitude - startCoordinate.longitude) * easedProgress,
      };

      displayCoordinateRef.current = nextCoordinate;
      setDisplayCoordinate(nextCoordinate);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      displayCoordinateRef.current = coordinate;
      animationFrameRef.current = null;
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [coordinate.latitude, coordinate.longitude, coordinateTimestamp]);

  return (
    <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={displayCoordinate} tracksViewChanges zIndex={markerZIndex}>
      <View style={styles.markerFrame}>
        {headingDegrees !== null ? (
          <View style={[styles.headingLayer, { transform: [{ rotate: `${headingDegrees}deg` }] }]}>
            <View style={styles.headingPointer}>
              <View style={styles.headingPointerTip} />
              <View style={styles.headingPointerStem} />
            </View>
          </View>
        ) : null}

        <View style={styles.markerOuterDot}>
          <View style={styles.markerDot} />
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  headingLayer: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'flex-start',
    position: 'absolute',
    width: 36,
  },
  headingPointer: {
    alignItems: 'center',
    height: 22,
    position: 'absolute',
    top: 1,
    width: 14,
  },
  headingPointerStem: {
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    height: 14,
    marginTop: -1,
    width: 4,
  },
  headingPointerTip: {
    borderBottomColor: '#007AFF',
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderLeftWidth: 5,
    borderRightColor: 'transparent',
    borderRightWidth: 5,
    height: 0,
    width: 0,
  },
  markerFrame: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    overflow: 'visible',
    width: 36,
  },
  markerDot: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  markerOuterDot: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 12,
    height: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    width: 16,
  },
});
