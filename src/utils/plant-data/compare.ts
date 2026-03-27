import type { RoutinePlants } from '@/domain/models/inspect-routines/inspect-routines.model';
import type { BooleanKeys, PlantData } from '@/domain/models/shared/plant-data.model';
import { occurenceKeys } from '@/shared/constants/values';

export function wasPlantUpdatedCheck(firstPlant: PlantData, secondPlant: PlantData): boolean {
  return occurenceKeys.some((key) => firstPlant[key] !== secondPlant[key]);
}

export function computeNumberOfOccurrences(plantData: PlantData): number {
  return occurenceKeys.reduce((count, key) => {
    return count + (plantData[key] === true ? 1 : 0);
  }, 0);
}

export function getChangedOccurrenceDiff(
  currentPlant: RoutinePlants | PlantData,
  updatedPlant: RoutinePlants | PlantData,
): Partial<Record<BooleanKeys, boolean>> {
  const differences: Partial<Record<BooleanKeys, boolean>> = {};

  if (currentPlant && updatedPlant) {
    occurenceKeys.forEach((key) => {
      if (currentPlant[key] !== null && updatedPlant[key] !== null) {
        if (currentPlant[key] !== updatedPlant[key]) {
          differences[key] = updatedPlant[key] as boolean;
        }
      }
    });
  }

  return differences;
}
