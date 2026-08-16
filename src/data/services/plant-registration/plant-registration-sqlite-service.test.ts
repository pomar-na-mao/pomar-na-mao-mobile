import type { SQLiteDatabase } from 'expo-sqlite';
import { createPlantRegistrationSqliteService } from './plant-registration-sqlite-service';

function createDatabase() {
  return {
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(async () => ({ changes: 1 })),
  };
}

const params = {
  latitude: -23.5,
  longitude: -46.6,
  gpsAccuracyM: 3,
  gpsTimestamp: 1_700_000_000_000,
  varietyId: 7,
  varietyName: 'Gala',
  zoneId: 'zone-1',
  zoneName: 'Norte',
  plantingDate: '2026-08-01T00:00:00.000Z',
};

describe('plant registration sqlite service', () => {
  it('creates an offline registration with stable identity and defaults', async () => {
    const database = createDatabase();
    const service = createPlantRegistrationSqliteService(database as unknown as SQLiteDatabase, {
      createId: () => 'local-1',
      getDeviceId: async () => 'device-1',
      now: () => '2026-08-12T12:00:00.000Z',
    });

    await expect(service.create(params)).resolves.toMatchObject({
      id: 'local-1',
      local_id: 'local-1',
      remote_plant_id: null,
      gps_accuracy_m: 3,
      gps_timestamp: 1_700_000_000_000,
      is_dead: 0,
      is_new: 1,
      non_existent: 0,
      sync_status: 'pending_create',
      record_origin: 'local_registration',
      device_id: 'device-1',
      created_at: '2026-08-12T12:00:00.000Z',
      updated_at: '2026-08-12T12:00:00.000Z',
    });
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("'local_registration'"),
      expect.arrayContaining(['local-1', 3, 1_700_000_000_000, 'device-1']),
    );
  });

  it('lists only local registrations and deletes locally', async () => {
    const database = createDatabase();
    database.getAllAsync.mockResolvedValue([{ id: 'local-1' }]);
    const service = createPlantRegistrationSqliteService(database as unknown as SQLiteDatabase);

    await expect(service.list()).resolves.toEqual([{ id: 'local-1' }]);
    expect(database.getAllAsync).toHaveBeenCalledWith(expect.stringContaining("record_origin = 'local_registration'"));
    await expect(service.deleteLocal('local-1')).resolves.toBe(true);
    expect(database.runAsync).toHaveBeenLastCalledWith(expect.stringContaining('DELETE FROM local_plants'), [
      'local-1',
    ]);

    await expect(service.deleteAllLocal()).resolves.toBe(1);
    expect(database.runAsync).toHaveBeenLastCalledWith(
      expect.stringContaining("DELETE FROM local_plants WHERE record_origin = 'local_registration'"),
    );
  });

  it('persists syncing, success, error and interrupted recovery states', async () => {
    const database = createDatabase();
    const service = createPlantRegistrationSqliteService(database as unknown as SQLiteDatabase, {
      now: () => '2026-08-12T13:00:00.000Z',
    });

    await expect(service.markSyncing('local-1')).resolves.toBe(true);
    await service.markSyncError('local-1', 'offline');
    await service.markSynced('local-1', {
      plant_id: 'remote-1',
      created_at: 'created',
      updated_at: 'updated',
      synced_at: 'synced',
    });
    await service.recoverInterruptedSyncs();

    const sqlCalls = database.runAsync.mock.calls as unknown as [string, unknown?][];
    expect(sqlCalls.map(([sql]) => sql)).toEqual([
      expect.stringContaining("sync_status = 'syncing'"),
      expect.stringContaining("sync_status = 'error'"),
      expect.stringContaining("sync_status = 'synced'"),
      expect.stringContaining("sync_status = 'error'"),
    ]);
    expect(sqlCalls[2][1]).toEqual(['remote-1', 'synced', 'created', 'updated', 'local-1']);
  });
});
