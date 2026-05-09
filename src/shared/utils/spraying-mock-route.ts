import type { LocationObject } from 'expo-location';

export const MOCK_LOCATION_UPDATE_INTERVAL_MS = 500;
export const MOCK_ROUTE_STEP_DISTANCE_METERS = 2;
export const MAX_MOCK_ROUTE_STEPS = 300;

export interface MockRouteCoordinate {
  latitude: number;
  longitude: number;
}

export interface SprayingMockRouteConfig {
  endCoordinate: MockRouteCoordinate;
  sessionId: string;
  startCoordinate: MockRouteCoordinate;
  startedAt: number;
}

export const createMockLocation = (latitude: number, longitude: number): LocationObject => ({
  coords: {
    latitude,
    longitude,
    altitude: 0,
    accuracy: 1,
    altitudeAccuracy: 1,
    heading: 0,
    speed: 0,
  },
  timestamp: Date.now(),
});

export const getMockRoutePointId = (sessionId: string, routeIndex: number): string => {
  return `${sessionId}:mock:${routeIndex}`;
};

const getCoordinateDistanceMeters = (start: MockRouteCoordinate, end: MockRouteCoordinate) => {
  const earthRadiusMeters = 6_371_000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(end.latitude - start.latitude);
  const longitudeDelta = toRadians(end.longitude - start.longitude);
  const startLatitude = toRadians(start.latitude);
  const endLatitude = toRadians(end.latitude);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const buildStraightMockRoute = (start: MockRouteCoordinate, end: MockRouteCoordinate) => {
  const distanceMeters = getCoordinateDistanceMeters(start, end);
  const steps = Math.min(
    MAX_MOCK_ROUTE_STEPS,
    Math.max(2, Math.ceil(distanceMeters / MOCK_ROUTE_STEP_DISTANCE_METERS)),
  );

  return Array.from({ length: steps + 1 }, (_, stepIndex) => {
    const progress = stepIndex / steps;

    return {
      latitude: start.latitude + (end.latitude - start.latitude) * progress,
      longitude: start.longitude + (end.longitude - start.longitude) * progress,
    };
  });
};
