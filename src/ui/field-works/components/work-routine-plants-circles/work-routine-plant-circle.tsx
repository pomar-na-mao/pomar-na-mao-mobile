import type { PlantsMarker } from '@/domain/models/shared/plant-data.model';
import { Colors } from '@/shared/constants/theme';
import { memo } from 'react';
import { Circle } from 'react-native-maps';

interface WorkRoutinePlantCircleProps {
  isNearestPlant: boolean;
  marker: PlantsMarker;
  theme: keyof typeof Colors;
}

export const WorkRoutinePlantCircle = memo(({ isNearestPlant, marker, theme }: WorkRoutinePlantCircleProps) => {
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

WorkRoutinePlantCircle.displayName = 'WorkRoutinePlantCircle';
