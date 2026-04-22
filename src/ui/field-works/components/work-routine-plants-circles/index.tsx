import type { PlantData } from '@/domain/models/shared/plant-data.model';
import { buildPlantsMarkers } from '@/utils/transformation/build-plants-map-markers';
import { memo, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { WorkRoutinePlantCircle } from './work-routine-plant-circle';

interface WorkRoutinePlantsCirclesProps {
  nearestPlantId?: string | null;
  plantsData: PlantData[];
}

export const WorkRoutinePlantsCircles: React.FC<WorkRoutinePlantsCirclesProps> = memo(
  ({ nearestPlantId, plantsData }) => {
    const plantsMarkers = useMemo(() => buildPlantsMarkers(plantsData), [plantsData]);
    const theme = useColorScheme() ?? 'light';

    return (
      <>
        {plantsMarkers.map((marker) => (
          <WorkRoutinePlantCircle
            key={`${marker.id}-${marker.id === nearestPlantId ? 'nearest' : 'default'}`}
            marker={marker}
            theme={theme}
            isNearestPlant={marker.id === nearestPlantId}
          />
        ))}
      </>
    );
  },
);

WorkRoutinePlantsCircles.displayName = 'WorkRoutinePlantsCircles';
