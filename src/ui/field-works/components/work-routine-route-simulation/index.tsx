import type { PlantData } from '@/domain/models/shared/plant-data.model';
import { Colors } from '@/shared/constants/theme';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { styles } from './style';

const MOCK_LOCATION_UPDATE_INTERVAL_MS = 500;
const MOCK_ROUTE_STEPS_BETWEEN_POINTS = 8;

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface WorkRoutineRouteSimulationProps {
  applyLocationUpdate: (location: Location.LocationObject) => void;
  onMockingLocationChange: (isMockingLocation: boolean) => void;
  plantsData: PlantData[];
  userLocation: Location.LocationObject;
}

const createMockLocation = (latitude: number, longitude: number): Location.LocationObject => ({
  coords: {
    latitude,
    longitude,
    altitude: 0,
    accuracy: 1,
    altitudeAccuracy: 1,
    heading: 0,
    speed: 0,
  },
  timestamp: Date.now(),
});

const buildMockRoute = (start: Coordinate, targets: Coordinate[]): Coordinate[] => {
  const routeTargets = [start, ...targets.slice(0, 6)];

  return routeTargets.flatMap((target, targetIndex) => {
    const previousTarget = routeTargets[targetIndex - 1];

    if (!previousTarget) {
      return [target];
    }

    return Array.from({ length: MOCK_ROUTE_STEPS_BETWEEN_POINTS }, (_, stepIndex) => {
      const progress = (stepIndex + 1) / MOCK_ROUTE_STEPS_BETWEEN_POINTS;

      return {
        latitude: previousTarget.latitude + (target.latitude - previousTarget.latitude) * progress,
        longitude: previousTarget.longitude + (target.longitude - previousTarget.longitude) * progress,
      };
    });
  });
};

export const WorkRoutineRouteSimulation: React.FC<WorkRoutineRouteSimulationProps> = ({
  applyLocationUpdate,
  onMockingLocationChange,
  plantsData,
  userLocation,
}) => {
  const theme = useColorScheme() ?? 'light';

  const mockWalkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopMockWalk = useCallback(() => {
    if (mockWalkIntervalRef.current) {
      clearInterval(mockWalkIntervalRef.current);
      mockWalkIntervalRef.current = null;
    }

    onMockingLocationChange(false);
  }, [onMockingLocationChange]);

  const moveToMockCoordinate = useCallback(
    (latitude: number, longitude: number) => {
      if (!__DEV__) {
        return;
      }

      stopMockWalk();
      onMockingLocationChange(true);
      applyLocationUpdate(createMockLocation(latitude, longitude));
    },
    [applyLocationUpdate, onMockingLocationChange, stopMockWalk],
  );

  const startMockWalk = useCallback(() => {
    if (!__DEV__ || plantsData.length === 0) {
      return;
    }

    stopMockWalk();
    onMockingLocationChange(true);

    const route = buildMockRoute(
      {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      },
      plantsData.map((plant) => ({ latitude: plant.latitude, longitude: plant.longitude })),
    );

    let routeIndex = 0;

    mockWalkIntervalRef.current = setInterval(() => {
      const nextCoordinate = route[routeIndex];

      if (!nextCoordinate) {
        stopMockWalk();
        return;
      }

      applyLocationUpdate(createMockLocation(nextCoordinate.latitude, nextCoordinate.longitude));
      routeIndex += 1;
    }, MOCK_LOCATION_UPDATE_INTERVAL_MS);
  }, [applyLocationUpdate, onMockingLocationChange, plantsData, stopMockWalk, userLocation]);

  useEffect(() => stopMockWalk, [stopMockWalk]);

  if (!__DEV__ || plantsData.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.mockControls,
        {
          borderColor: Colors[theme].cardBorder,
          backgroundColor: Colors[theme].card,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.mockButtonPrimary, { backgroundColor: Colors[theme].confirmationButtonBackground }]}
        onPress={startMockWalk}
      >
        <Text
          style={[
            styles.mockButtonPrimaryText,
            { color: theme === 'dark' ? Colors.dark.text : Colors.light.background },
          ]}
        >
          Simular
        </Text>
      </TouchableOpacity>

      {plantsData.slice(0, 3).map((plant, index) => (
        <TouchableOpacity
          activeOpacity={0.8}
          key={plant.id}
          style={[styles.mockButton, { backgroundColor: Colors[theme].cancelButtonBackground }]}
          onPress={() => moveToMockCoordinate(plant.latitude, plant.longitude)}
        >
          <Text style={[styles.mockButtonText, { color: Colors[theme].text }]}>P{index + 1}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.mockButton, { backgroundColor: Colors[theme].cancelButtonBackground }]}
        onPress={stopMockWalk}
      >
        <Text style={[styles.mockButtonText, { color: Colors[theme].text }]}>Parar</Text>
      </TouchableOpacity>
    </View>
  );
};
