import * as Location from 'expo-location';
import { useRef } from 'react';
import { useSprayingSqliteService } from '@/data/services/spraying/use-spraying-sqlite-service';
import { useSprayingStore } from '@/data/store/spraying/use-spraying-store';

export function useSprayingGpsTracker() {
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const flushIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sprayingService = useSprayingSqliteService();
  const addLiveRoutePoint = useSprayingStore((s) => s.addLiveRoutePoint);
  const setLiveRoutePoints = useSprayingStore((s) => s.setLiveRoutePoints);

  async function startTracking(sessionId: string): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return false;
    }

    // Limpa pontos anteriores ao iniciar novo rastreamento
    setLiveRoutePoints([]);

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

        const point = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        // Salva no SQLite (via buffer)
        sprayingService.bufferRoutePoint(sessionId, {
          ...point,
          accuracy: location.coords.accuracy ?? undefined,
        });

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

    // Garante que nenhum ponto seja perdido
    await sprayingService.flushRouteBuffer();
  }

  return { startTracking, stopTracking };
}
