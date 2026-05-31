import type { PlantMapMarkerData } from './index';

export function getPlantMapMarkerId(marker: PlantMapMarkerData) {
  return marker.plantId ?? marker.id ?? `${marker.latitude}:${marker.longitude}`;
}
