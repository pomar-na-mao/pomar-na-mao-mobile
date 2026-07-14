import type { InspectionPlant } from '@/domain/models/inspection';
import { twoPointsDistance } from '@/utils/geolocation/geolocation-math';
import type { LocationObject } from 'expo-location';

export const MEANINGFUL_DISTANCE_CHANGE_METERS = 0.5;

const NEAREST_PLANT_TIE_MARGIN_METERS = 0.25;
const NEAREST_PLANT_DISTANCE_EPSILON_METERS = 0.001;

interface ShouldKeepCurrentNearestPlantParams {
  candidateDistanceMeters: number;
  candidatePlantId: string;
  currentLocation: LocationObject;
  currentNearestPlant: InspectionPlant | null;
}

interface ShouldPersistNearestPlantParams {
  candidateDistanceMeters: number;
  candidatePlantId: string;
  lastPersistedNearest: { plantId: string; distance: number } | null;
}

export function findNearestInspectionPlant(
  location: LocationObject,
  plants: InspectionPlant[],
  preferredPlantId?: string | null,
) {
  if (plants.length === 0) {
    return null;
  }

  const userPoint = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };

  let nearestPlant = plants[0];
  let nearestDistance = twoPointsDistance(userPoint, nearestPlant);

  for (const plant of plants.slice(1)) {
    const distance = twoPointsDistance(userPoint, plant);

    const isCloser = distance + NEAREST_PLANT_DISTANCE_EPSILON_METERS < nearestDistance;
    const isSameDistance = Math.abs(distance - nearestDistance) <= NEAREST_PLANT_DISTANCE_EPSILON_METERS;
    const shouldPreferPlant =
      isSameDistance &&
      ((plant.plantId === preferredPlantId && nearestPlant.plantId !== preferredPlantId) ||
        (nearestPlant.plantId !== preferredPlantId && plant.plantId.localeCompare(nearestPlant.plantId) < 0));

    if (isCloser || shouldPreferPlant) {
      nearestPlant = plant;
      nearestDistance = distance;
    }
  }

  return { plant: nearestPlant, distance: nearestDistance };
}

export function shouldKeepCurrentNearestPlant(params: ShouldKeepCurrentNearestPlantParams) {
  const { candidateDistanceMeters, candidatePlantId, currentLocation, currentNearestPlant } = params;

  if (!currentNearestPlant || currentNearestPlant.plantId === candidatePlantId) {
    return false;
  }

  const currentNearestDistanceMeters = twoPointsDistance(
    {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    },
    currentNearestPlant,
  );

  return currentNearestDistanceMeters - candidateDistanceMeters <= NEAREST_PLANT_TIE_MARGIN_METERS;
}

export function shouldPersistNearestPlant(params: ShouldPersistNearestPlantParams) {
  const { candidateDistanceMeters, candidatePlantId, lastPersistedNearest } = params;

  return (
    !lastPersistedNearest ||
    lastPersistedNearest.plantId !== candidatePlantId ||
    Math.abs(lastPersistedNearest.distance - candidateDistanceMeters) >= MEANINGFUL_DISTANCE_CHANGE_METERS
  );
}
