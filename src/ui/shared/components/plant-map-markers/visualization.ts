import { getPlantMapMarkerId } from './helpers';
import type { PlantMapMarkerData } from './index';

export const PLANT_MAP_MAX_OVERLAYS = 250;
export const PLANT_MAP_VIEWPORT_OVERSCAN = 0.15;
const INDEX_BUCKET_DEGREES = 0.01;
const MIN_REGION_DELTA = 0.002;
const REGION_PADDING_FACTOR = 1.4;

export interface PlantMapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface PlantMapBounds {
  northEast: { latitude: number; longitude: number };
  southWest: { latitude: number; longitude: number };
}

export interface PlantMapIndividualVisualization {
  type: 'plant';
  id: string;
  plant: PlantMapMarkerData;
  isPriority: boolean;
}

export interface PlantMapClusterVisualization {
  type: 'cluster';
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  highlightedCount: number;
  bounds: PlantMapBounds;
}

export type PlantMapVisualization = PlantMapIndividualVisualization | PlantMapClusterVisualization;

export interface PlantMapVisualizationResult {
  items: PlantMapVisualization[];
  diagnostics: {
    sourceCount: number;
    candidateCount: number;
    individualCount: number;
    clusterCount: number;
    overlayCount: number;
    durationMs: number;
  };
}

interface PlantSpatialIndex {
  buckets: Map<string, PlantMapMarkerData[]>;
  sourceCount: number;
}

const normalizeLongitude = (longitude: number) => ((((longitude + 180) % 360) + 360) % 360) - 180;
const bucketKey = (latitudeIndex: number, longitudeIndex: number) => `${latitudeIndex}:${longitudeIndex}`;
const longitudeBucket = (longitude: number) => {
  if (longitude >= 180) return Math.ceil(360 / INDEX_BUCKET_DEGREES) - 1;
  if (longitude <= -180) return 0;
  return Math.floor((normalizeLongitude(longitude) + 180) / INDEX_BUCKET_DEGREES);
};
const latitudeBucket = (latitude: number) => Math.floor((latitude + 90) / INDEX_BUCKET_DEGREES);
const isValidPlant = (plant: PlantMapMarkerData) =>
  Number.isFinite(plant.latitude) &&
  Number.isFinite(plant.longitude) &&
  plant.latitude >= -90 &&
  plant.latitude <= 90 &&
  plant.longitude >= -180 &&
  plant.longitude <= 180;

export function createPlantMapRegion(
  plants: PlantMapMarkerData[],
  fallbackCenter?: { latitude: number; longitude: number } | null,
  minimumDelta = MIN_REGION_DELTA,
): PlantMapRegion {
  const validPlants = plants.filter(isValidPlant);

  if (validPlants.length === 0) {
    return {
      latitude: fallbackCenter?.latitude ?? 0,
      longitude: fallbackCenter?.longitude ?? 0,
      latitudeDelta: minimumDelta,
      longitudeDelta: minimumDelta,
    };
  }

  const latitudes = validPlants.map((plant) => plant.latitude);
  const longitudes = validPlants.map((plant) => plant.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeDelta = Math.max((maxLatitude - minLatitude) * REGION_PADDING_FACTOR, minimumDelta);
  const longitudeDelta = Math.max((maxLongitude - minLongitude) * REGION_PADDING_FACTOR, minimumDelta);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta,
    longitudeDelta,
  };
}

export function createPlantSpatialIndex(plants: PlantMapMarkerData[]): PlantSpatialIndex {
  const buckets = new Map<string, PlantMapMarkerData[]>();
  const seen = new Set<string>();
  const validPlants = plants
    .filter(isValidPlant)
    .filter((plant) => {
      const id = getPlantMapMarkerId(plant);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .sort((left, right) => getPlantMapMarkerId(left).localeCompare(getPlantMapMarkerId(right)));

  for (const plant of validPlants) {
    const key = bucketKey(latitudeBucket(plant.latitude), longitudeBucket(plant.longitude));
    const bucket = buckets.get(key);
    if (bucket) bucket.push(plant);
    else buckets.set(key, [plant]);
  }

  return { buckets, sourceCount: plants.length };
}

function longitudeRanges(west: number, east: number): [number, number][] {
  if (west <= -180 && east >= 180) return [[-180, 180]];
  if (west < -180)
    return [
      [west + 360, 180],
      [-180, east],
    ];
  if (east > 180)
    return [
      [west, 180],
      [-180, east - 360],
    ];
  return [[west, east]];
}

export function queryPlantSpatialIndex(index: PlantSpatialIndex, region: PlantMapRegion): PlantMapMarkerData[] {
  const latitudePadding = region.latitudeDelta * PLANT_MAP_VIEWPORT_OVERSCAN;
  const longitudePadding = region.longitudeDelta * PLANT_MAP_VIEWPORT_OVERSCAN;
  const south = Math.max(-90, region.latitude - region.latitudeDelta / 2 - latitudePadding);
  const north = Math.min(90, region.latitude + region.latitudeDelta / 2 + latitudePadding);
  const west = region.longitude - region.longitudeDelta / 2 - longitudePadding;
  const east = region.longitude + region.longitudeDelta / 2 + longitudePadding;
  const result: PlantMapMarkerData[] = [];
  const ranges = longitudeRanges(west, east);
  const isInside = (plant: PlantMapMarkerData) => {
    const longitude = normalizeLongitude(plant.longitude);
    return (
      plant.latitude >= south &&
      plant.latitude <= north &&
      ranges.some(([rangeWest, rangeEast]) => longitude >= rangeWest && longitude <= rangeEast)
    );
  };
  const latitudeBucketCount = latitudeBucket(north) - latitudeBucket(south) + 1;
  const longitudeBucketCount = ranges.reduce(
    (count, [rangeWest, rangeEast]) => count + longitudeBucket(rangeEast) - longitudeBucket(rangeWest) + 1,
    0,
  );

  if (latitudeBucketCount * longitudeBucketCount > index.buckets.size * 4) {
    for (const bucket of index.buckets.values()) {
      for (const plant of bucket) {
        if (isInside(plant)) result.push(plant);
      }
    }
    return result;
  }

  for (let latitudeIndex = latitudeBucket(south); latitudeIndex <= latitudeBucket(north); latitudeIndex += 1) {
    for (const [rangeWest, rangeEast] of ranges) {
      for (
        let longitudeIndex = longitudeBucket(rangeWest);
        longitudeIndex <= longitudeBucket(rangeEast);
        longitudeIndex += 1
      ) {
        const bucket = index.buckets.get(bucketKey(latitudeIndex, longitudeIndex));
        if (!bucket) continue;
        for (const plant of bucket) {
          if (isInside(plant)) result.push(plant);
        }
      }
    }
  }

  return result;
}

function isHighlighted(plant: PlantMapMarkerData) {
  return Boolean(plant.isChanged || plant.isHighlighted || plant.markerBorderColor || plant.markerFillColor);
}

function aggregate(
  candidates: PlantMapMarkerData[],
  region: PlantMapRegion,
  cellMultiplier: number,
): PlantMapVisualization[] {
  const targetColumns = Math.max(1, Math.floor(Math.sqrt(PLANT_MAP_MAX_OVERLAYS)));
  const latitudeCell = Math.max(region.latitudeDelta / targetColumns, 0.000001) * cellMultiplier;
  const longitudeCell = Math.max(region.longitudeDelta / targetColumns, 0.000001) * cellMultiplier;
  const groups = new Map<string, PlantMapMarkerData[]>();

  for (const plant of candidates) {
    const row = Math.floor((plant.latitude + 90) / latitudeCell);
    const column = Math.floor((normalizeLongitude(plant.longitude) + 180) / longitudeCell);
    const key = `${row}:${column}`;
    const group = groups.get(key);
    if (group) group.push(plant);
    else groups.set(key, [plant]);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([cellId, plants]) => {
      if (plants.length === 1) {
        const plant = plants[0];
        return { type: 'plant', id: getPlantMapMarkerId(plant), plant, isPriority: false };
      }

      const latitudes = plants.map((plant) => plant.latitude);
      const longitudes = plants.map((plant) => normalizeLongitude(plant.longitude));
      return {
        type: 'cluster',
        id: `cluster:${cellId}`,
        latitude: latitudes.reduce((sum, value) => sum + value, 0) / plants.length,
        longitude: longitudes.reduce((sum, value) => sum + value, 0) / plants.length,
        count: plants.length,
        highlightedCount: plants.filter(isHighlighted).length,
        bounds: {
          northEast: { latitude: Math.max(...latitudes), longitude: Math.max(...longitudes) },
          southWest: { latitude: Math.min(...latitudes), longitude: Math.min(...longitudes) },
        },
      };
    });
}

export function selectPlantMapVisualization(
  index: PlantSpatialIndex,
  region: PlantMapRegion,
  priorityPlantId?: string | null,
  currentPlants?: PlantMapMarkerData[],
): PlantMapVisualizationResult {
  const startedAt = Date.now();
  const currentPlantsById = currentPlants
    ? new Map(currentPlants.map((plant) => [getPlantMapMarkerId(plant), plant]))
    : null;
  const candidates = queryPlantSpatialIndex(index, region).map(
    (plant) => currentPlantsById?.get(getPlantMapMarkerId(plant)) ?? plant,
  );
  const priorityPlant = priorityPlantId
    ? candidates.find((plant) => getPlantMapMarkerId(plant) === priorityPlantId)
    : undefined;
  const regularCandidates = priorityPlant ? candidates.filter((plant) => plant !== priorityPlant) : candidates;
  const regularBudget = PLANT_MAP_MAX_OVERLAYS - (priorityPlant ? 1 : 0);
  let multiplier = 1;
  let items = aggregate(regularCandidates, region, multiplier);
  while (items.length > regularBudget && multiplier < 1024) {
    multiplier *= 1.6;
    items = aggregate(regularCandidates, region, multiplier);
  }
  if (priorityPlant) {
    items.unshift({ type: 'plant', id: getPlantMapMarkerId(priorityPlant), plant: priorityPlant, isPriority: true });
  }

  const individualCount = items.filter((item) => item.type === 'plant').length;
  const clusterCount = items.length - individualCount;
  return {
    items: items.slice(0, PLANT_MAP_MAX_OVERLAYS),
    diagnostics: {
      sourceCount: index.sourceCount,
      candidateCount: candidates.length,
      individualCount,
      clusterCount,
      overlayCount: Math.min(items.length, PLANT_MAP_MAX_OVERLAYS),
      durationMs: Date.now() - startedAt,
    },
  };
}
