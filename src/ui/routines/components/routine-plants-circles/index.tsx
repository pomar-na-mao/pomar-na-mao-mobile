import type { PlantData } from '@/domain/models/shared/plant-data.model';
import { buildPlantsMarkers } from '@/utils/transformation/build-plants-map-markers';
import { memo, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { RoutinePlantCircle } from './routine-plant-circle';

interface RoutinePlantsCirclesProps {
  nearestPlantId?: string | null;
  plantsData: PlantData[];
}

export const RoutinePlantsCircles: React.FC<RoutinePlantsCirclesProps> = memo(
  ({ nearestPlantId, plantsData }) => {
    const plantsMarkers = useMemo(() => buildPlantsMarkers(plantsData), [plantsData]);
    const theme = useColorScheme() ?? 'light';

    return (
      <>
        {plantsMarkers.map((marker) => (
          <RoutinePlantCircle
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

RoutinePlantsCircles.displayName = 'RoutinePlantsCircles';
