import type { PlantData, PlantsMarker, PlantsMarkerWithWasUpdatedInfo } from '@/domain/models/shared/plant-data.model';

export const buildPlantsMarkers = (plantsData: PlantData[]): PlantsMarker[] => {
  let collectedPlantsMarkers: PlantsMarker[] = [];

  if (plantsData && plantsData?.length > 0) {
    plantsData.forEach((plant) => {
      const marker = {
        id: plant?.id,
        latitude: plant?.latitude,
        longitude: plant?.longitude,
      };

      collectedPlantsMarkers.push(marker);
    });
  }

  return collectedPlantsMarkers;
};

export const buildPlantsMarkersWithUpdateInfo = (plantsData: PlantData[]): PlantsMarkerWithWasUpdatedInfo[] | null => {
  let collectedPlantsMarkers: PlantsMarkerWithWasUpdatedInfo[] = [];

  if (plantsData && plantsData.length > 0) {
    plantsData?.forEach((plant) => {
      const marker = {
        id: plant?.id,
        latitude: plant?.latitude,
        longitude: plant?.longitude,
        wasUpdated: plant?.wasUpdated,
      };

      collectedPlantsMarkers.push(marker);
    });
  }

  return collectedPlantsMarkers;
};
