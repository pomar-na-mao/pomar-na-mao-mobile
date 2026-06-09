import { initializeDatabases } from '@/data/services/sqlite/initialize-sqlite-database';
import { getActiveSprayingTracking } from '@/data/services/spraying/spraying-location-service';
import { createSprayingSqliteService } from '@/data/services/spraying/spraying-sqlite-service';
import { openDatabaseAsync } from 'expo-sqlite';
import { persistSprayingLocations } from './spraying-background-location-task';

jest.mock('@/data/services/sqlite/initialize-sqlite-database', () => ({
  initializeDatabases: jest.fn(),
}));

jest.mock('@/data/services/spraying/spraying-sqlite-service', () => ({
  createSprayingSqliteService: jest.fn(),
}));

jest.mock('@/data/services/spraying/spraying-location-service', () => ({
  getActiveSprayingTracking: jest.fn(),
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

jest.mock('expo-location', () => ({
  stopLocationUpdatesAsync: jest.fn(),
}));

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskDefined: jest.fn(() => false),
}));

describe('spraying background location task', () => {
  it('persists accepted locations without mounted React state', async () => {
    const database = { closeAsync: jest.fn() };
    const appendTrackPoint = jest.fn(async (params) => ({
      id: 'point-1',
      local_id: 'point-1',
      field_operation_local_id: params.operationId,
      recorded_at: params.recordedAt,
      latitude: params.latitude,
      longitude: params.longitude,
      speed_mps: params.speedMps,
      accuracy_m: params.accuracyM,
      device_id: params.deviceId,
      sync_status: 'pending_create',
      remote_track_point_id: null,
      sync_error: null,
      created_at: params.recordedAt,
    }));
    jest.mocked(openDatabaseAsync).mockResolvedValue(database as never);
    jest.mocked(getActiveSprayingTracking).mockResolvedValue({
      operationId: 'operation-1',
      deviceId: 'device-1',
    });
    jest.mocked(createSprayingSqliteService).mockReturnValue({
      getLastTrackPoint: jest.fn(async () => null),
      appendTrackPoint,
    } as never);

    await persistSprayingLocations([
      {
        coords: {
          latitude: -23,
          longitude: -49,
          altitude: null,
          accuracy: 2,
          altitudeAccuracy: null,
          heading: null,
          speed: 1,
        },
        timestamp: Date.now(),
      },
    ]);

    expect(initializeDatabases).toHaveBeenCalledWith(database);
    expect(appendTrackPoint).toHaveBeenCalledWith(
      expect.objectContaining({
        operationId: 'operation-1',
        deviceId: 'device-1',
        latitude: -23,
        longitude: -49,
      }),
    );
    expect(database.closeAsync).toHaveBeenCalled();
  });
});
