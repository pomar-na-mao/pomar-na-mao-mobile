import { renderHook } from '@testing-library/react-native';
import { randomUUID } from 'expo-crypto';
import { useSQLiteContext } from 'expo-sqlite';
import { createMockSQLiteDatabase, type MockSQLiteDatabase } from '@/test/inspection/sqlite-mock';
import {
  inspectionFilter,
  inspectionFilterOptions,
  inspectionPlant,
  localInspection,
  localInspectionChange,
  localLoadedPlant,
  secondInspectionPlant,
  syncManualInspectionResult,
} from '@/test/inspection/fixtures';
import { useInspectionSqliteService } from './use-inspection-sqlite-service';

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(),
}));

jest.mock('expo-sqlite', () => ({
  useSQLiteContext: jest.fn(),
}));

const mockedRandomUUID = jest.mocked(randomUUID);
const mockedUseSQLiteContext = jest.mocked(useSQLiteContext);

function renderService(database: MockSQLiteDatabase) {
  mockedUseSQLiteContext.mockReturnValue(database as never);
  return renderHook(() => useInspectionSqliteService()).result.current;
}

describe('useInspectionSqliteService', () => {
  let database: MockSQLiteDatabase;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-30T12:00:00.000Z'));
    mockedRandomUUID.mockReturnValue('generated-id');
    database = createMockSQLiteDatabase();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reads cached filter options from local structural tables', async () => {
    database.getAllAsync
      .mockResolvedValueOnce(inspectionFilterOptions.zones)
      .mockResolvedValueOnce(inspectionFilterOptions.occurrenceTypes)
      .mockResolvedValueOnce(inspectionFilterOptions.varieties);
    const service = renderService(database);

    await expect(service.getCachedFilterOptions()).resolves.toEqual(inspectionFilterOptions);

    expect(database.getAllAsync).toHaveBeenNthCalledWith(
      1,
      'SELECT id, name, description FROM local_zones ORDER BY name',
    );
    expect(database.getAllAsync).toHaveBeenNthCalledWith(
      2,
      'SELECT id, code, name FROM local_occurrence_types ORDER BY name',
    );
    expect(database.getAllAsync).toHaveBeenNthCalledWith(
      3,
      'SELECT id, name, description FROM local_varieties ORDER BY name',
    );
  });

  it('creates an inspection and loaded plant rows inside one transaction', async () => {
    const service = renderService(database);

    const inspection = await service.createInspection(inspectionFilter, [inspectionPlant, secondInspectionPlant]);

    expect(inspection).toMatchObject({
      id: 'generated-id',
      plants_loaded_count: 2,
      status: 'in_progress',
      sync_status: 'pending',
      zone_id: inspectionFilter.zoneId,
    });
    expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(database.runAsync).toHaveBeenCalledTimes(3);
    expect(String(database.runAsync.mock.calls[0][0])).toContain('INSERT INTO local_inspections');
    expect(String(database.runAsync.mock.calls[1][0])).toContain(
      'INSERT OR REPLACE INTO local_inspection_loaded_plants',
    );
    expect(database.runAsync.mock.calls[1][1]).toContain('generated-id:plant-1');
    expect(database.runAsync.mock.calls[2][1]).toContain('generated-id:plant-2');
  });

  it('maps inspection lookup, inspection list, and loaded plant rows', async () => {
    database.getFirstAsync.mockResolvedValue(localInspection);
    database.getAllAsync.mockResolvedValueOnce([localInspection]).mockResolvedValueOnce([localLoadedPlant]);
    const service = renderService(database);

    await expect(service.getInspectionById(localInspection.id)).resolves.toEqual(localInspection);
    await expect(service.listInspections()).resolves.toEqual([
      {
        finishedAt: null,
        id: localInspection.id,
        occurrenceName: localInspection.occurrence_name,
        plantsChangedCount: localInspection.plants_changed_count,
        plantsLoadedCount: localInspection.plants_loaded_count,
        startedAt: localInspection.started_at,
        status: localInspection.status,
        syncStatus: localInspection.sync_status,
        zoneName: localInspection.zone_name,
      },
    ]);
    await expect(service.getLoadedPlants(localInspection.id)).resolves.toEqual([
      expect.objectContaining({
        distanceMeters: localLoadedPlant.distance_meters,
        isChanged: true,
        isNearest: true,
        occurrences: [expect.objectContaining({ occurrenceTypeId: 'occurrence-1' })],
        plantId: localLoadedPlant.plant_id,
      }),
    ]);
  });

  it('updates nearest plant, records changes, refreshes changed count, and finishes inspections', async () => {
    database.getFirstAsync.mockResolvedValue({ count: 1 });
    const service = renderService(database);

    await service.updateNearestPlant({
      distanceMeters: 3.5,
      inspectionId: localInspection.id,
      plantId: inspectionPlant.plantId,
      userLatitude: -23.1,
      userLongitude: -46.1,
    });
    await service.addInspectionChange({
      changeType: 'add_occurrence',
      inspectionId: localInspection.id,
      newValue: { name: 'Praga' },
      occurrenceCode: 'PST',
      occurrenceName: 'Praga',
      occurrenceTypeId: 'occurrence-1',
      plant: inspectionPlant,
    });
    await service.finishInspection(localInspection.id);

    const sqlCalls = database.runAsync.mock.calls.map((call) => String(call[0]));
    expect(sqlCalls.some((sql) => sql.includes('nearest_plant_id'))).toBe(true);
    expect(sqlCalls.some((sql) => sql.includes('INSERT INTO local_inspection_changes'))).toBe(true);
    expect(sqlCalls.some((sql) => sql.includes('COUNT(DISTINCT plant_id)'))).toBe(false);
    expect(database.getFirstAsync).toHaveBeenCalledWith(
      'SELECT COUNT(DISTINCT plant_id) as count FROM local_inspection_changes WHERE inspection_local_id = ?',
      [localInspection.id],
    );
    expect(sqlCalls.some((sql) => sql.includes("SET status = 'finished'"))).toBe(true);
  });

  it('builds a sync payload grouped by plant and parses JSON values', async () => {
    database.getFirstAsync.mockResolvedValue(localInspection);
    database.getAllAsync.mockResolvedValue([
      localInspectionChange,
      {
        ...localInspectionChange,
        id: 'change-2',
        new_value_json: '{invalid-json',
        plant_id: secondInspectionPlant.plantId,
        previous_value_json: JSON.stringify({ old: true }),
      },
    ]);
    const service = renderService(database);

    const payload = await service.buildSyncPayload(localInspection.id, 'device-1');

    expect(payload.localInspectionId).toBe(localInspection.id);
    expect(payload.deviceId).toBe('device-1');
    expect(payload.plantsChanged).toHaveLength(2);
    expect(payload.plantsChanged[0].changes[0].newValue).toEqual({ name: 'Praga' });
    expect(payload.plantsChanged[1].changes[0].previousValue).toEqual({ old: true });
    expect(payload.plantsChanged[1].changes[0].newValue).toBeUndefined();
  });

  it('throws when building a sync payload for a missing inspection', async () => {
    database.getFirstAsync.mockResolvedValue(null);
    const service = renderService(database);

    await expect(service.buildSyncPayload('missing-id', 'device-1')).rejects.toThrow(/local n.o encontrada/);
  });

  it('updates sync status and clears changed state', async () => {
    const service = renderService(database);

    await service.markInspectionSyncing(localInspection.id);
    await service.markInspectionSynced(localInspection.id, syncManualInspectionResult);
    await service.markInspectionSyncError(localInspection.id, 'sync failed');
    await service.clearLoadedPlantsChangedState(localInspection.id);

    const sqlCalls = database.runAsync.mock.calls.map((call) => String(call[0]));
    expect(sqlCalls.some((sql) => sql.includes("sync_status = 'syncing'"))).toBe(true);
    expect(sqlCalls.some((sql) => sql.includes("status = 'synced'"))).toBe(true);
    expect(sqlCalls.some((sql) => sql.includes("sync_status = 'error'"))).toBe(true);
    expect(sqlCalls.some((sql) => sql.includes('SET is_changed = 0'))).toBe(true);
  });
});
