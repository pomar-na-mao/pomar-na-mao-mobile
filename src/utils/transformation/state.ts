import type { PlantData } from '@/domain/models/shared/plant-data.model';
import type { Point } from '../geolocation/geolocation-math';

export const setInitialRoutineDetailLocation = (plantsData: PlantData[], regionPoints: Point[]) => {
  if (plantsData.length > 0) {
    return {
      latitude: plantsData[0]?.latitude,
      longitude: plantsData[0]?.longitude,
      latitudeDelta: 0.001,
      longitudeDelta: 0.001,
    };
  }

  return {
    latitude: regionPoints[0]?.latitude,
    longitude: regionPoints[0]?.longitude,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  };
};
