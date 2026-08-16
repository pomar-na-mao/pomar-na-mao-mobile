import {
  SPRAYING_ACTIVE_OPERATION_KEY,
  SPRAYING_LOCATION_TASK,
  type ActiveSprayingTracking,
} from '@/shared/constants/spraying-background-location';
import { hasPreciseLocationPermission } from '@/shared/helpers/high-accuracy-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

export type SprayingTrackingReconciliation = 'inactive' | 'active' | 'recovery_required';

export async function getActiveSprayingTracking(): Promise<ActiveSprayingTracking | null> {
  const rawValue = await AsyncStorage.getItem(SPRAYING_ACTIVE_OPERATION_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const value = JSON.parse(rawValue) as Partial<ActiveSprayingTracking>;
    if (!value.operationId || !value.deviceId) {
      throw new Error('Invalid active spraying tracking data.');
    }

    return {
      operationId: value.operationId,
      deviceId: value.deviceId,
    };
  } catch {
    await AsyncStorage.removeItem(SPRAYING_ACTIVE_OPERATION_KEY);
    return null;
  }
}

export async function requestSprayingLocationPermissions(): Promise<boolean> {
  if (!(await TaskManager.isAvailableAsync())) {
    return false;
  }

  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted' || !hasPreciseLocationPermission(foreground)) {
    return false;
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  return background.status === 'granted';
}

export async function startSprayingLocationUpdates(operationId: string, deviceId: string): Promise<boolean> {
  if (!(await requestSprayingLocationPermissions())) {
    return false;
  }

  const activeTask = await Location.hasStartedLocationUpdatesAsync(SPRAYING_LOCATION_TASK);
  if (activeTask) {
    await Location.stopLocationUpdatesAsync(SPRAYING_LOCATION_TASK);
  }

  await AsyncStorage.setItem(
    SPRAYING_ACTIVE_OPERATION_KEY,
    JSON.stringify({ operationId, deviceId } satisfies ActiveSprayingTracking),
  );

  try {
    await Location.startLocationUpdatesAsync(SPRAYING_LOCATION_TASK, {
      accuracy: Location.Accuracy.BestForNavigation,
      activityType: Location.ActivityType.AutomotiveNavigation,
      distanceInterval: 1,
      timeInterval: 1_000,
      deferredUpdatesDistance: 5,
      deferredUpdatesInterval: 5_000,
      foregroundService: {
        notificationTitle: 'Pulverização em andamento',
        notificationBody: 'Registrando a rota mesmo com o celular bloqueado.',
        notificationColor: '#315C2B',
        killServiceOnDestroy: false,
      },
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
    });
    return true;
  } catch (error) {
    await AsyncStorage.removeItem(SPRAYING_ACTIVE_OPERATION_KEY);
    throw error;
  }
}

export async function stopSprayingLocationUpdates() {
  const activeTask = await Location.hasStartedLocationUpdatesAsync(SPRAYING_LOCATION_TASK);
  if (activeTask) {
    await Location.stopLocationUpdatesAsync(SPRAYING_LOCATION_TASK);
  }
  await AsyncStorage.removeItem(SPRAYING_ACTIVE_OPERATION_KEY);
}

export async function reconcileSprayingLocationUpdates(
  operationId?: string | null,
): Promise<SprayingTrackingReconciliation> {
  const [activeTracking, activeTask] = await Promise.all([
    getActiveSprayingTracking(),
    Location.hasStartedLocationUpdatesAsync(SPRAYING_LOCATION_TASK),
  ]);

  if (!operationId) {
    if (activeTask) {
      await Location.stopLocationUpdatesAsync(SPRAYING_LOCATION_TASK);
    }
    if (activeTracking) {
      await AsyncStorage.removeItem(SPRAYING_ACTIVE_OPERATION_KEY);
    }
    return 'inactive';
  }

  if (activeTask && activeTracking?.operationId === operationId) {
    return 'active';
  }

  if (activeTask) {
    await Location.stopLocationUpdatesAsync(SPRAYING_LOCATION_TASK);
  }

  return 'recovery_required';
}
