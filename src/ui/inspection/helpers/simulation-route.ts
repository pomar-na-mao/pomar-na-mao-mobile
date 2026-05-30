import { twoPointsDistance } from '@/utils/geolocation/geolocation-math';
import type { LocationObject } from 'expo-location';
import type { LatLng } from 'react-native-maps';

export type SimulationPointIndex = 0 | 1 | 2;
export type InspectionSimulationPoints = [LatLng | null, LatLng | null, LatLng | null];

export const EMPTY_SIMULATION_POINTS: InspectionSimulationPoints = [null, null, null];
export const SIMULATION_LOCATION_INTERVAL_MS = 250;

const SIMULATION_STEP_DISTANCE_METERS = 0.75;
const MAX_SIMULATION_ROUTE_STEPS = 800;
const SIMULATION_WALKING_SPEED_METERS_PER_SECOND = 1.2;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number) {
  return (value * 180) / Math.PI;
}

function getBearingDegrees(start: LatLng, end: LatLng) {
  const startLatitude = toRadians(start.latitude);
  const endLatitude = toRadians(end.latitude);
  const longitudeDelta = toRadians(end.longitude - start.longitude);
  const y = Math.sin(longitudeDelta) * Math.cos(endLatitude);
  const x =
    Math.cos(startLatitude) * Math.sin(endLatitude) -
    Math.sin(startLatitude) * Math.cos(endLatitude) * Math.cos(longitudeDelta);

  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

export function createSimulationLocation(
  coordinate: LatLng,
  nextCoordinate: LatLng,
  timestamp: number,
): LocationObject {
  return {
    coords: {
      accuracy: 1,
      altitude: 0,
      altitudeAccuracy: 1,
      heading: getBearingDegrees(coordinate, nextCoordinate),
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      speed: SIMULATION_WALKING_SPEED_METERS_PER_SECOND,
    },
    timestamp,
  };
}

function buildRouteSegment(start: LatLng, end: LatLng) {
  const distanceMeters = twoPointsDistance(start, end);
  const steps = Math.min(
    MAX_SIMULATION_ROUTE_STEPS,
    Math.max(2, Math.ceil(distanceMeters / SIMULATION_STEP_DISTANCE_METERS)),
  );

  return Array.from({ length: steps + 1 }, (_, stepIndex) => {
    const progress = stepIndex / steps;

    return {
      latitude: start.latitude + (end.latitude - start.latitude) * progress,
      longitude: start.longitude + (end.longitude - start.longitude) * progress,
    };
  });
}

export function buildSimulationRoute(points: InspectionSimulationPoints) {
  const [firstPoint, secondPoint, thirdPoint] = points;

  if (!firstPoint || !secondPoint || !thirdPoint) {
    return [];
  }

  return [...buildRouteSegment(firstPoint, secondPoint), ...buildRouteSegment(secondPoint, thirdPoint).slice(1)];
}
