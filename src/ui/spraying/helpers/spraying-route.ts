import type {
  LocalSprayingTrackPoint,
  SprayingLineString,
  SprayingPlant,
  SprayingSimulationMatch,
} from '@/domain/models/spraying';
import { twoPointsDistance } from '@/utils/geolocation/geolocation-math';

const EARTH_RADIUS_METERS = 6_371_000;
const METERS_PER_LATITUDE_DEGREE = 111_320;

export interface ConsolidatedSprayingRoute {
  geojson: SprayingLineString;
  distanceMeters: number;
  startedAt: string;
  finishedAt: string;
}

export interface NearestRoutePoint {
  distanceMeters: number;
  segmentIndex: number;
  latitude: number;
  longitude: number;
  nearestTrackPointLocalId: string | null;
  matchedAt: string | null;
}

export function consolidateSprayingRoute(points: LocalSprayingTrackPoint[]): ConsolidatedSprayingRoute {
  const ordered = [...points].sort(
    (left, right) => new Date(left.recorded_at).getTime() - new Date(right.recorded_at).getTime(),
  );

  if (ordered.length < 2) {
    throw new Error('A rota precisa de pelo menos dois pontos GPS validos.');
  }

  let distanceMeters = 0;
  for (let index = 1; index < ordered.length; index += 1) {
    distanceMeters += twoPointsDistance(ordered[index - 1], ordered[index]);
  }

  return {
    geojson: {
      type: 'LineString',
      coordinates: ordered.map((point) => [point.longitude, point.latitude]),
    },
    distanceMeters,
    startedAt: ordered[0].recorded_at,
    finishedAt: ordered[ordered.length - 1].recorded_at,
  };
}

function toLocalMeters(latitude: number, longitude: number, referenceLatitude: number): { x: number; y: number } {
  const metersPerLongitudeDegree = METERS_PER_LATITUDE_DEGREE * Math.cos((referenceLatitude * Math.PI) / 180);

  return {
    x: longitude * metersPerLongitudeDegree,
    y: latitude * METERS_PER_LATITUDE_DEGREE,
  };
}

export function findNearestPointOnSprayingRoute(
  plant: Pick<SprayingPlant, 'latitude' | 'longitude'>,
  points: LocalSprayingTrackPoint[],
): NearestRoutePoint | null {
  const ordered = [...points].sort(
    (left, right) => new Date(left.recorded_at).getTime() - new Date(right.recorded_at).getTime(),
  );

  if (ordered.length < 2) {
    return null;
  }

  const referenceLatitude = plant.latitude;
  const target = toLocalMeters(plant.latitude, plant.longitude, referenceLatitude);
  let nearest: NearestRoutePoint | null = null;

  for (let index = 0; index < ordered.length - 1; index += 1) {
    const start = ordered[index];
    const end = ordered[index + 1];
    const startMeters = toLocalMeters(start.latitude, start.longitude, referenceLatitude);
    const endMeters = toLocalMeters(end.latitude, end.longitude, referenceLatitude);
    const segmentX = endMeters.x - startMeters.x;
    const segmentY = endMeters.y - startMeters.y;
    const segmentLengthSquared = segmentX * segmentX + segmentY * segmentY;
    const projection =
      segmentLengthSquared === 0
        ? 0
        : Math.max(
          0,
          Math.min(
            1,
            ((target.x - startMeters.x) * segmentX + (target.y - startMeters.y) * segmentY) / segmentLengthSquared,
          ),
        );
    const projectedX = startMeters.x + projection * segmentX;
    const projectedY = startMeters.y + projection * segmentY;
    const distanceMeters = Math.hypot(target.x - projectedX, target.y - projectedY);

    if (!nearest || distanceMeters < nearest.distanceMeters) {
      const nearestEndpoint = projection <= 0.5 ? start : end;
      nearest = {
        distanceMeters,
        segmentIndex: index,
        latitude: projectedY / METERS_PER_LATITUDE_DEGREE,
        longitude: projectedX / (METERS_PER_LATITUDE_DEGREE * Math.cos((referenceLatitude * Math.PI) / 180)),
        nearestTrackPointLocalId: nearestEndpoint.local_id,
        matchedAt: nearestEndpoint.recorded_at,
      };
    }
  }

  return nearest;
}

export function getExpandedRouteBounds(points: LocalSprayingTrackPoint[], expansionMeters: number) {
  if (points.length === 0) {
    return null;
  }

  const meanLatitude = points.reduce((total, point) => total + point.latitude, 0) / points.length;
  const latitudeExpansion = expansionMeters / METERS_PER_LATITUDE_DEGREE;
  const longitudeExpansion = expansionMeters / (METERS_PER_LATITUDE_DEGREE * Math.cos((meanLatitude * Math.PI) / 180));

  return {
    minLatitude: Math.min(...points.map((point) => point.latitude)) - latitudeExpansion,
    maxLatitude: Math.max(...points.map((point) => point.latitude)) + latitudeExpansion,
    minLongitude: Math.min(...points.map((point) => point.longitude)) - longitudeExpansion,
    maxLongitude: Math.max(...points.map((point) => point.longitude)) + longitudeExpansion,
  };
}

export function simulateSprayingPlants(params: {
  plants: SprayingPlant[];
  points: LocalSprayingTrackPoint[];
  minDistanceMeters?: number;
  maxDistanceMeters?: number;
}): SprayingSimulationMatch[] {
  const maxDistanceMeters = params.maxDistanceMeters ?? 4;

  if (maxDistanceMeters <= 0) {
    throw new Error('A faixa lateral de Pulverização e invalida.');
  }

  const bounds = getExpandedRouteBounds(params.points, maxDistanceMeters);
  if (!bounds) {
    return [];
  }

  return params.plants.flatMap((plant) => {
    if (
      plant.latitude < bounds.minLatitude ||
      plant.latitude > bounds.maxLatitude ||
      plant.longitude < bounds.minLongitude ||
      plant.longitude > bounds.maxLongitude
    ) {
      return [];
    }

    const nearest = findNearestPointOnSprayingRoute(plant, params.points);
    if (!nearest || nearest.distanceMeters > maxDistanceMeters) {
      return [];
    }

    return [
      {
        plantId: plant.plantId,
        distanceMeters: nearest.distanceMeters,
        nearestTrackPointLocalId: nearest.nearestTrackPointLocalId,
        matchedAt: nearest.matchedAt,
      },
    ];
  });
}

export function metersToRadians(distanceMeters: number): number {
  return distanceMeters / EARTH_RADIUS_METERS;
}
