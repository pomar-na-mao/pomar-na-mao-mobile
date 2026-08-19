import * as Location from 'expo-location';
import {
  getActiveSprayingTracking,
  reconcileSprayingLocationUpdates,
  startSprayingLocationUpdates,
  stopSprayingLocationUpdates,
} from './spraying-location-service';

const mockStorage = new Map<string, string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string) => {
    mockStorage.set(key, value);
  }),
  removeItem: jest.fn(async (key: string) => {
    mockStorage.delete(key);
  }),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  requestBackgroundPermissionsAsync: jest.fn(),
  hasStartedLocationUpdatesAsync: jest.fn(),
  startLocationUpdatesAsync: jest.fn(),
  stopLocationUpdatesAsync: jest.fn(),
  Accuracy: { BestForNavigation: 6 },
  ActivityType: { AutomotiveNavigation: 3 },
}));
jest.mock('expo-task-manager', () => ({
  isAvailableAsync: jest.fn(async () => true),
}));

const mockLocation = jest.mocked(Location);

describe('spraying location service', () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
    mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      android: { accuracy: 'fine' },
      granted: true,
      status: 'granted',
    } as unknown as Location.LocationPermissionResponse);
    mockLocation.requestBackgroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    } as unknown as Location.LocationPermissionResponse);
    mockLocation.hasStartedLocationUpdatesAsync.mockResolvedValue(false);
  });

  it('does not start when background permission is denied', async () => {
    mockLocation.requestBackgroundPermissionsAsync.mockResolvedValue({
      status: 'denied',
    } as unknown as Location.LocationPermissionResponse);

    await expect(startSprayingLocationUpdates('operation-1', 'device-1')).resolves.toBe(false);
    expect(mockLocation.startLocationUpdatesAsync).not.toHaveBeenCalled();
  });

  it('does not request background tracking with approximate foreground permission', async () => {
    mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      android: { accuracy: 'coarse' },
      granted: true,
      status: 'granted',
    } as unknown as Location.LocationPermissionResponse);

    await expect(startSprayingLocationUpdates('operation-1', 'device-1')).resolves.toBe(false);
    expect(mockLocation.requestBackgroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('stores active identity and starts the background task', async () => {
    await expect(startSprayingLocationUpdates('operation-1', 'device-1')).resolves.toBe(true);

    await expect(getActiveSprayingTracking()).resolves.toEqual({
      operationId: 'operation-1',
      deviceId: 'device-1',
    });
    expect(mockLocation.startLocationUpdatesAsync).toHaveBeenCalledWith(
      'pomar-na-mao-spraying-location',
      expect.objectContaining({ distanceInterval: 1, timeInterval: 1_000 }),
    );
  });

  it('detects active and interrupted tracking', async () => {
    await startSprayingLocationUpdates('operation-1', 'device-1');
    mockLocation.hasStartedLocationUpdatesAsync.mockResolvedValue(true);

    await expect(reconcileSprayingLocationUpdates('operation-1')).resolves.toBe('active');
    await expect(reconcileSprayingLocationUpdates('operation-2')).resolves.toBe('recovery_required');
  });

  it('stops the native task and clears active identity', async () => {
    await startSprayingLocationUpdates('operation-1', 'device-1');
    mockLocation.hasStartedLocationUpdatesAsync.mockResolvedValue(true);

    await stopSprayingLocationUpdates();

    expect(mockLocation.stopLocationUpdatesAsync).toHaveBeenCalled();
    await expect(getActiveSprayingTracking()).resolves.toBeNull();
  });
});
