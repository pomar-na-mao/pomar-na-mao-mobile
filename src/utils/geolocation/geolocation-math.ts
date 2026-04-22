import type { PlantData } from '@/domain/models/shared/plant-data.model';
import { LocationObject } from 'expo-location';

export interface Point {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface NearestPlantResult {
  plant: PlantData;
  distance: number;
}

export const maxAcceptableAccuracy = 20; // meters

export const threshold = 2; // meters

export const bufferSize = 4;

//Formula de Haversine
export const twoPointsDistance = (userLocation: Point, plantLocation: Point): number => {
  const earthRadius = 6371000; // Raio da Terra em metros
  const latitudeDiff = (plantLocation.latitude - userLocation.latitude) * (Math.PI / 180); // Diferença de latitudes
  const longitudeDiff = (plantLocation.longitude - userLocation.longitude) * (Math.PI / 180); // Diferença de longitudes

  //O quadrado da metade da distância entre os pontos em uma esfera (levando em conta a curvatura da Terra)
  const haversineConstant =
    Math.sin(latitudeDiff / 2) * Math.sin(latitudeDiff / 2) +
    Math.cos(userLocation.latitude * (Math.PI / 180)) *
      Math.cos(plantLocation.latitude * (Math.PI / 180)) *
      Math.sin(longitudeDiff / 2) *
      Math.sin(longitudeDiff / 2);

  const angularDistance = 2 * Math.atan2(Math.sqrt(haversineConstant), Math.sqrt(1 - haversineConstant));
  const distance = earthRadius * angularDistance;

  return distance;
};

export const getDistance = (P1: Point, P2: Point): number => {
  const earthRadius = 6371000; // Raio da Terra em metros
  const φ1 = (P1.latitude * Math.PI) / 180;
  const φ2 = (P2.latitude * Math.PI) / 180;
  const Δφ = ((P2.latitude - P1.latitude) * Math.PI) / 180;
  const Δλ = ((P2.longitude - P1.longitude) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c; // in meters
};

export const averagePosition = (buffer: Coordinate[]): Coordinate => {
  const sum = buffer.reduce(
    (acc, pos) => {
      acc.latitude += pos.latitude;
      acc.longitude += pos.longitude;
      return acc;
    },
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: sum.latitude / buffer.length,
    longitude: sum.longitude / buffer.length,
    accuracy: 0, // placeholder or average if needed
  };
};

export const sortCoordinatesClockwise = (points: [number, number][]): [number, number][] => {
  const center = points.reduce(
    (acc, point) => [acc[0] + point[0] / points.length, acc[1] + point[1] / points.length],
    [0, 0],
  );

  return points.slice().sort((a, b) => {
    const angleA = Math.atan2(a[1] - center[1], a[0] - center[0]);
    const angleB = Math.atan2(b[1] - center[1], b[0] - center[0]);
    return angleA - angleB;
  });
};

/**
 * Computes the convex hull of a set of points using the Monotone Chain algorithm.
 * Returns the points in clockwise order.
 */
export const getConvexHull = (points: [number, number][]): [number, number][] => {
  if (points.length <= 2) return points;

  // Sort points primarily by latitude and secondarily by longitude
  const sortedPoints = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const crossProduct = (o: [number, number], a: [number, number], b: [number, number]) => {
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  };

  const lower: [number, number][] = [];
  for (const p of sortedPoints) {
    while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: [number, number][] = [];
  for (let i = sortedPoints.length - 1; i >= 0; i--) {
    const p = sortedPoints[i];
    while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  upper.pop();
  lower.pop();
  return lower.concat(upper);
};

export const getPolygonCentroid = (points: Point[]): Point | null => {
  if (points.length === 0) {
    return null;
  }

  let latitudeSum = 0;
  let longitudeSum = 0;

  for (const point of points) {
    latitudeSum += point.latitude;
    longitudeSum += point.longitude;
  }

  return {
    latitude: latitudeSum / points.length,
    longitude: longitudeSum / points.length,
  };
};

export const detectNearestPlantWithDistance = (
  currentLocation: LocationObject,
  plants: PlantData[],
): NearestPlantResult | null => {
  if (!plants || plants.length === 0) {
    return null;
  }

  const userPoint: Point = {
    latitude: currentLocation.coords.latitude,
    longitude: currentLocation.coords.longitude,
  };

  let nearestCollect = plants[0];

  const firstCollectPoint: Point = {
    latitude: nearestCollect.latitude,
    longitude: nearestCollect.longitude,
  };

  let minimumDistance = twoPointsDistance(userPoint, firstCollectPoint);

  for (const collect of plants.slice(1)) {
    const collectPoint: Point = {
      latitude: collect.latitude,
      longitude: collect.longitude,
    };

    const distance = twoPointsDistance(userPoint, collectPoint);

    if (distance < minimumDistance) {
      minimumDistance = distance;
      nearestCollect = collect;
    } else if (Math.abs(distance - minimumDistance) < 0.1) {
      // In case of a tie, prefer the plant with lower ID for consistency
      if (collect.id < nearestCollect.id) {
        minimumDistance = distance;
        nearestCollect = collect;
      }
    }
  }

  return {
    plant: nearestCollect,
    distance: minimumDistance,
  };
};

export const detectNearestPlant = (currentLocation: LocationObject, plants: PlantData[]): PlantData | null => {
  return detectNearestPlantWithDistance(currentLocation, plants)?.plant ?? null;
};
