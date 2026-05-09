import { useSprayingSqliteService } from '@/data/services/spraying/use-spraying-sqlite-service';
import { useSprayingStore } from '@/data/store/spraying/use-spraying-store';
import { SPRAYING_MOCK_ROUTE_CONFIG_KEY } from '@/shared/constants/spraying-background-location';
import { Colors } from '@/shared/constants/theme';
import {
  buildStraightMockRoute,
  createMockLocation,
  getMockRoutePointId,
  type MockRouteCoordinate,
  MOCK_LOCATION_UPDATE_INTERVAL_MS,
  type SprayingMockRouteConfig,
} from '@/shared/utils/spraying-mock-route';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { styles } from './style';

export type { MockRouteCoordinate } from '@/shared/utils/spraying-mock-route';

export type MockRouteSelectionMode = 'start' | 'end' | null;

interface SprayingRouteSimulationProps {
  applyLocationUpdate: (location: Location.LocationObject) => void;
  endCoordinate: MockRouteCoordinate | null;
  onSelectionModeChange: (mode: MockRouteSelectionMode) => void;
  selectionMode: MockRouteSelectionMode;
  startCoordinate: MockRouteCoordinate | null;
}

export const SprayingRouteSimulation: React.FC<SprayingRouteSimulationProps> = ({
  applyLocationUpdate,
  endCoordinate,
  onSelectionModeChange,
  selectionMode,
  startCoordinate,
}) => {
  const theme = useColorScheme() ?? 'light';
  const sprayingService = useSprayingSqliteService();
  const activeSession = useSprayingStore((state) => state.activeSession);
  const addLiveRoutePoint = useSprayingStore((state) => state.addLiveRoutePoint);
  const isTracking = useSprayingStore((state) => state.isTracking);
  const setLiveRoutePoints = useSprayingStore((state) => state.setLiveRoutePoints);
  const setIsMockingLocation = useSprayingStore((state) => state.setIsMockingLocation);

  const mockWalkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sprayingServiceRef = useRef(sprayingService);
  const setIsMockingLocationRef = useRef(setIsMockingLocation);
  const hasPreparedMockRouteRef = useRef(false);
  sprayingServiceRef.current = sprayingService;
  setIsMockingLocationRef.current = setIsMockingLocation;

  const recordMockCoordinate = useCallback(
    (latitude: number, longitude: number, routeIndex: number, timestamp: number) => {
      if (!activeSession) {
        return;
      }

      const point = { latitude, longitude };

      sprayingServiceRef.current.bufferRoutePoint(activeSession.id, {
        ...point,
        accuracy: 1,
        gpsTimestamp: timestamp,
        id: getMockRoutePointId(activeSession.id, routeIndex),
      });
      addLiveRoutePoint(point);
      applyLocationUpdate(createMockLocation(latitude, longitude));
    },
    [activeSession, addLiveRoutePoint, applyLocationUpdate],
  );

  const stopMockWalk = useCallback(async (disableMockingLocation = true) => {
    if (mockWalkIntervalRef.current) {
      clearInterval(mockWalkIntervalRef.current);
      mockWalkIntervalRef.current = null;
    }

    await sprayingServiceRef.current.flushRouteBuffer();
    await AsyncStorage.removeItem(SPRAYING_MOCK_ROUTE_CONFIG_KEY);
    if (disableMockingLocation) {
      setIsMockingLocationRef.current(false);
    }
  }, []);

  const startMockWalk = useCallback(async () => {
    if (!__DEV__ || !activeSession || !isTracking || !startCoordinate || !endCoordinate) {
      return;
    }

    await stopMockWalk(false);
    setIsMockingLocation(true);
    const startedAt = Date.now();

    if (!hasPreparedMockRouteRef.current) {
      await sprayingServiceRef.current.clearRoutePoints(activeSession.id);
      setLiveRoutePoints([]);
      hasPreparedMockRouteRef.current = true;
    }

    const route = buildStraightMockRoute(startCoordinate, endCoordinate);
    const config: SprayingMockRouteConfig = {
      endCoordinate,
      sessionId: activeSession.id,
      startCoordinate,
      startedAt,
    };

    await AsyncStorage.setItem(SPRAYING_MOCK_ROUTE_CONFIG_KEY, JSON.stringify(config));

    let routeIndex = 0;

    mockWalkIntervalRef.current = setInterval(() => {
      const nextCoordinate = route[routeIndex];

      if (!nextCoordinate) {
        stopMockWalk(false).catch(console.error);
        return;
      }

      recordMockCoordinate(
        nextCoordinate.latitude,
        nextCoordinate.longitude,
        routeIndex,
        startedAt + routeIndex * MOCK_LOCATION_UPDATE_INTERVAL_MS,
      );
      routeIndex += 1;
    }, MOCK_LOCATION_UPDATE_INTERVAL_MS);
  }, [
    activeSession,
    endCoordinate,
    isTracking,
    recordMockCoordinate,
    setIsMockingLocation,
    setLiveRoutePoints,
    startCoordinate,
    stopMockWalk,
  ]);

  const selectStartCoordinate = useCallback(() => {
    stopMockWalk().catch(console.error);
    setIsMockingLocation(true);
    hasPreparedMockRouteRef.current = false;
    onSelectionModeChange('start');
  }, [onSelectionModeChange, setIsMockingLocation, stopMockWalk]);

  const selectEndCoordinate = useCallback(() => {
    stopMockWalk().catch(console.error);
    setIsMockingLocation(true);
    hasPreparedMockRouteRef.current = false;
    onSelectionModeChange('end');
  }, [onSelectionModeChange, setIsMockingLocation, stopMockWalk]);

  useEffect(() => {
    if (!activeSession || activeSession.status !== 'in_progress') {
      hasPreparedMockRouteRef.current = false;
      stopMockWalk().catch(console.error);
      onSelectionModeChange(null);
    }
  }, [activeSession, onSelectionModeChange, stopMockWalk]);

  useEffect(() => () => void stopMockWalk(), [stopMockWalk]);

  if (!__DEV__ || !activeSession || activeSession.status !== 'in_progress') {
    return null;
  }

  const canStartMockWalk = Boolean(isTracking && startCoordinate && endCoordinate);

  return (
    <View
      style={[
        styles.mockControls,
        {
          backgroundColor: theme === 'dark' ? 'rgba(28, 29, 28, 0.92)' : 'rgba(255, 255, 255, 0.92)',
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={!canStartMockWalk}
        style={[
          styles.mockButtonPrimary,
          { backgroundColor: canStartMockWalk ? Colors[theme].tint : Colors[theme].grey },
        ]}
        onPress={startMockWalk}
      >
        <MaterialCommunityIcons name="play" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.mockButton,
          {
            backgroundColor: selectionMode === 'start' ? Colors[theme].tint : Colors[theme].background,
            borderColor: selectionMode === 'start' ? Colors[theme].tint : Colors[theme].line,
          },
        ]}
        onPress={selectStartCoordinate}
      >
        <Text style={[styles.mockButtonText, { color: selectionMode === 'start' ? '#FFFFFF' : Colors[theme].text }]}>
          A
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.mockButton,
          {
            backgroundColor: selectionMode === 'end' ? Colors[theme].tint : Colors[theme].background,
            borderColor: selectionMode === 'end' ? Colors[theme].tint : Colors[theme].line,
          },
        ]}
        onPress={selectEndCoordinate}
      >
        <Text style={[styles.mockButtonText, { color: selectionMode === 'end' ? '#FFFFFF' : Colors[theme].text }]}>
          B
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.mockIconButton, { backgroundColor: Colors[theme].background, borderColor: Colors[theme].line }]}
        onPress={() => {
          stopMockWalk().catch(console.error);
        }}
      >
        <MaterialCommunityIcons name="stop" size={24} color={Colors[theme].text} />
      </TouchableOpacity>
    </View>
  );
};
