import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRef } from 'react';
import { useSprayingSqliteService } from '@/data/services/spraying/use-spraying-sqlite-service';
import { useSprayingStore } from '@/data/store/spraying/use-spraying-store';
import {
  SPRAYING_BACKGROUND_LOCATION_TASK,
  SPRAYING_BACKGROUND_SESSION_ID_KEY,
} from '@/shared/constants/spraying-background-location';
import {
  type AcceptedRouteLocation,
  getRoutePointFromLocation,
  shouldAcceptSprayingRouteLocation,
} from '@/shared/utils/spraying-route-location-filter';

export function useSprayingGpsTracker() {
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const flushIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAcceptedLocationRef = useRef<AcceptedRouteLocation | null>(null);
  const sprayingService = useSprayingSqliteService();
  const addLiveRoutePoint = useSprayingStore((s) => s.addLiveRoutePoint);
  const setLiveRoutePoints = useSprayingStore((s) => s.setLiveRoutePoints);
  const setTrackingStartedAt = useSprayingStore((s) => s.setTrackingStartedAt);

  async function startTracking(sessionId: string): Promise<boolean> {
    const taskManagerAvailable = await TaskManager.isAvailableAsync();
    if (!taskManagerAvailable) {
      return false;
    }

    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
      return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      return false;
    }

    // Limpa pontos anteriores ao iniciar novo rastreamento
    setLiveRoutePoints([]);
    setTrackingStartedAt(new Date().toISOString());
    lastAcceptedLocationRef.current = null;
    await AsyncStorage.setItem(SPRAYING_BACKGROUND_SESSION_ID_KEY, sessionId);

    const hasStartedBackgroundUpdates = await Location.hasStartedLocationUpdatesAsync(
      SPRAYING_BACKGROUND_LOCATION_TASK,
    );

    if (!hasStartedBackgroundUpdates) {
      await Location.startLocationUpdatesAsync(SPRAYING_BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        activityType: Location.ActivityType.Fitness,
        distanceInterval: 1,
        foregroundService: {
          notificationTitle: 'Pulverização em andamento',
          notificationBody: 'Registrando a rota mesmo com o celular bloqueado.',
          notificationColor: '#166534',
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
        timeInterval: 1_000,
      });
    }

    subscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 1,
        timeInterval: 1_000,
      },
      (location) => {
        if (__DEV__ && useSprayingStore.getState().isMockingLocation) {
          return;
        }

        if (!shouldAcceptSprayingRouteLocation(location, lastAcceptedLocationRef.current)) {
          return;
        }

        const point = getRoutePointFromLocation(location);
        lastAcceptedLocationRef.current = {
          point,
          timestamp: location.timestamp || Date.now(),
        };

        // Atualiza UI em tempo real
        addLiveRoutePoint(point);
      },
    );

    flushIntervalRef.current = setInterval(() => {
      sprayingService.flushRouteBuffer().catch(console.error);
    }, 30_000);

    return true;
  }

  async function stopTracking(): Promise<void> {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;

    if (flushIntervalRef.current !== null) {
      clearInterval(flushIntervalRef.current);
      flushIntervalRef.current = null;
    }

    const hasStartedBackgroundUpdates = await Location.hasStartedLocationUpdatesAsync(
      SPRAYING_BACKGROUND_LOCATION_TASK,
    );

    if (hasStartedBackgroundUpdates) {
      await Location.stopLocationUpdatesAsync(SPRAYING_BACKGROUND_LOCATION_TASK);
    }

    await AsyncStorage.removeItem(SPRAYING_BACKGROUND_SESSION_ID_KEY);
    // Garante que nenhum ponto seja perdido
    await sprayingService.flushRouteBuffer();
    setTrackingStartedAt(null);
  }

  return { startTracking, stopTracking };
}
