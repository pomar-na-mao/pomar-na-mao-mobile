import {
  createPlantSpatialIndex,
  selectPlantMapVisualization,
  type PlantMapRegion,
} from '@/ui/shared/components/plant-map-markers/visualization';
import type { PlantMapMarkerData } from '@/ui/shared/components/plant-map-markers';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function usePlantMapVisualization(
  plants: PlantMapMarkerData[],
  initialRegion: PlantMapRegion,
  priorityPlantId?: string | null,
  isRegionReady = true,
) {
  const [region, setRegion] = useState(initialRegion);
  const hasInitializedRegion = useRef(isRegionReady);
  const lastResetKeyRef = useRef<string | null>(isRegionReady ? null : null);
  const coordinateKey = plants
    .map((plant) => `${plant.plantId ?? plant.id}:${plant.latitude}:${plant.longitude}`)
    .join('|');

  useEffect(() => {
    const regionResetKey = coordinateKey || 'no-plants';
    if (isRegionReady && (!hasInitializedRegion.current || lastResetKeyRef.current !== regionResetKey)) {
      hasInitializedRegion.current = true;
      lastResetKeyRef.current = regionResetKey;
      setRegion(initialRegion);
    }
  }, [coordinateKey, initialRegion, isRegionReady]);
  const index = useMemo(() => createPlantSpatialIndex(plants), [coordinateKey]);
  const result = useMemo(
    () => selectPlantMapVisualization(index, region, priorityPlantId, plants),
    [index, plants, priorityPlantId, region],
  );
  const onRegionChangeComplete = useCallback((nextRegion: PlantMapRegion) => setRegion(nextRegion), []);

  return { ...result, onRegionChangeComplete, region };
}
