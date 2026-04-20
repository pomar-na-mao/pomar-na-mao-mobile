import type { PlantData } from '@/domain/models/shared/plant-data.model';
import { buildPlantsMarkers } from '@/utils/transformation/build-plants-map-markers';
import { memo, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { OccurrencesRoutePlantCircle } from './occurrences-route-plant-circle';

interface OccurrencesRoutePlantsCirclesProps {
  nearestPlantId?: string | null;
  plantsData: PlantData[];
}

export const OccurrencesRoutePlantsCircles: React.FC<OccurrencesRoutePlantsCirclesProps> = memo(
  ({ nearestPlantId, plantsData }) => {
    const plantsMarkers = useMemo(() => buildPlantsMarkers(plantsData), [plantsData]);
    const theme = useColorScheme() ?? 'light';

    return (
      <>
        {plantsMarkers.map((marker) => (
          <OccurrencesRoutePlantCircle
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

OccurrencesRoutePlantsCircles.displayName = 'OccurrencesRoutePlantsCircles';
