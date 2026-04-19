import type { PlantData, PlantsMarker } from '@/domain/models/shared/plant-data.model';
import { Colors } from '@/shared/constants/theme';

import { buildPlantsMarkers } from '@/utils/transformation/build-plants-map-markers';
import { memo, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Circle } from 'react-native-maps';

interface RoutinePlantsCirclesProps {
  nearestPlantId: string | null;
  plantsData: PlantData[];
}

interface RoutinePlantCircleProps {
  isNearestPlant: boolean;
  marker: PlantsMarker;
  theme: keyof typeof Colors;
}

const RoutinePlantCircle = memo(({ isNearestPlant, marker, theme }: RoutinePlantCircleProps) => {
  const circleColor = isNearestPlant ? Colors[theme].secondary : Colors[theme].plantCircle;

  return (
    <Circle
      center={{
        latitude: marker.latitude,
        longitude: marker.longitude,
      }}
      radius={2}
      strokeWidth={1}
      strokeColor={circleColor}
      fillColor={circleColor}
    />
  );
});

RoutinePlantCircle.displayName = 'RoutinePlantCircle';

export const RoutinePlantsCircles: React.FC<RoutinePlantsCirclesProps> = memo(({ nearestPlantId, plantsData }) => {
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
});

RoutinePlantsCircles.displayName = 'RoutinePlantsCircles';
