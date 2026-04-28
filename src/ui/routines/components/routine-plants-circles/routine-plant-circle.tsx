import type { PlantsMarker } from '@/domain/models/shared/plant-data.model';
import { Colors } from '@/shared/constants/theme';
import { memo } from 'react';
import { Circle } from 'react-native-maps';

interface RoutinePlantCircleProps {
  isNearestPlant: boolean;
  marker: PlantsMarker;
  theme: keyof typeof Colors;
}

export const RoutinePlantCircle = memo(({ isNearestPlant, marker, theme }: RoutinePlantCircleProps) => {
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
