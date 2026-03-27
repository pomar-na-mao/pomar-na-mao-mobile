import type { SqliteRoutine } from '@/domain/models/inspect-routines/inspect-routines.model';
import type { PlantData, PlantsMarker } from '@/domain/models/shared/plant-data.model';
import { Colors } from '@/shared/constants/theme';

import { buildPlantsMarkers } from '@/utils/transformation/build-plants-map-markers';
import { useEffect, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import { Circle } from 'react-native-maps';

interface RoutinePlantsCirclesProps {
  nearestPlant: PlantData | null;
  selectedRoutine: SqliteRoutine | null;
}

export const RoutinePlantsCircles: React.FC<RoutinePlantsCirclesProps> = ({ nearestPlant, selectedRoutine }) => {
  const [plantsMarkers, setPlantsMakers] = useState<PlantsMarker[]>([]);

  useEffect(() => {
    const plantsData = JSON.parse(selectedRoutine?.plant_data as string) as PlantData[];
    const plantsMarkers = buildPlantsMarkers(plantsData);
    setPlantsMakers(plantsMarkers);
  }, [selectedRoutine]);

  const theme = useColorScheme() ?? 'light';

  return (
    <View>
      {plantsMarkers && nearestPlant ? (
        <>
          {plantsMarkers.map((marker) => {
            const isNearestPlant = marker.id === nearestPlant.id;
            return (
              <Circle
                key={`${marker.id}-${nearestPlant.id}`}
                center={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                radius={2}
                strokeWidth={1}
                strokeColor={isNearestPlant ? Colors[theme].secondary : Colors[theme].plantCircle}
                fillColor={isNearestPlant ? Colors[theme].secondary : Colors[theme].plantCircle}
              />
            );
          })}
        </>
      ) : null}
    </View>
  );
};
