import { createSprayingSqliteService } from './spraying-sqlite-service';
import { createMockSprayingSQLiteDatabase } from '@/test/spraying/sqlite-mock';
import { sprayingOperationFixture } from '@/test/spraying/fixtures';
import type { SQLiteDatabase } from 'expo-sqlite';

const validSetup = {
  zoneId: 'zone-1',
  zoneName: 'Talhao 1',
  operatorName: 'Operador',
  machineName: 'Pulverizador',
  tractorIdentifier: 'Trator 1',
  minDistanceMeters: 3.5,
  maxDistanceMeters: 9,
  inputs: [{ inputType: 'insecticide', productName: 'Produto X', dose: 2, doseUnit: 'L/ha' }],
};

describe('spraying sqlite service', () => {
  it('creates operation and inputs in one transaction', async () => {
    const database = createMockSprayingSQLiteDatabase();
    const service = createSprayingSqliteService(database as unknown as SQLiteDatabase);

    const operation = await service.createOperation(validSetup, 'device-1');

    expect(operation.lifecycle_status).toBe('draft');
    expect(operation.min_distance_meters).toBe(3.5);
    expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO local_spraying_operations'),
      expect.any(Array),
    );
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO local_spraying_inputs'),
      expect.any(Array),
    );
  });

  it('lists all local spraying operations ordered by date', async () => {
    const database = createMockSprayingSQLiteDatabase();
    database.getAllAsync.mockResolvedValue([sprayingOperationFixture]);
    const service = createSprayingSqliteService(database as unknown as SQLiteDatabase);

    const list = await service.listOperations();

    expect(list).toEqual([sprayingOperationFixture]);
    expect(database.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM local_spraying_operations'),
    );
  });

  it('recovers only the most recently updated draft or tracking operation', async () => {
    const database = createMockSprayingSQLiteDatabase();
    database.getFirstAsync.mockResolvedValue(sprayingOperationFixture);
    const service = createSprayingSqliteService(database as unknown as SQLiteDatabase);

    const operation = await service.getInProgressOperation();

    expect(operation).toEqual(sprayingOperationFixture);
    expect(database.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining("WHERE lifecycle_status IN ('draft', 'tracking')"),
    );
    expect(database.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY updated_at DESC, created_at DESC, id DESC'),
    );
  });

  it('keeps completed unsynchronized operations listed without treating them as in progress', async () => {
    const database = createMockSprayingSQLiteDatabase();
    const finishedOperation = {
      ...sprayingOperationFixture,
      lifecycle_status: 'finished' as const,
      finished_at: '2026-06-07T13:00:00.000Z',
    };
    database.getFirstAsync.mockResolvedValue(null);
    database.getAllAsync.mockResolvedValue([finishedOperation]);
    const service = createSprayingSqliteService(database as unknown as SQLiteDatabase);

    await expect(service.getInProgressOperation()).resolves.toBeNull();
    await expect(service.listOperations()).resolves.toEqual([finishedOperation]);
  });

  it('allows a new operation when only completed unsynchronized operations exist', async () => {
    const database = createMockSprayingSQLiteDatabase();
    database.getFirstAsync.mockResolvedValue(null);
    const service = createSprayingSqliteService(database as unknown as SQLiteDatabase);

    await expect(service.createOperation(validSetup, 'device-1')).resolves.toMatchObject({
      lifecycle_status: 'draft',
      zone_id: validSetup.zoneId,
    });
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO local_spraying_operations'),
      expect.any(Array),
    );
  });

  it('rejects creation when another draft or tracking operation exists', async () => {
    const database = createMockSprayingSQLiteDatabase();
    database.getFirstAsync.mockResolvedValue(sprayingOperationFixture);
    const service = createSprayingSqliteService(database as unknown as SQLiteDatabase);

    await expect(service.createOperation(validSetup, 'device-1')).rejects.toThrow('pulverizacao em andamento');
    expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(database.runAsync).not.toHaveBeenCalled();
  });

  it('rejects incomplete setup before writing', async () => {
    const database = createMockSprayingSQLiteDatabase();
    const service = createSprayingSqliteService(database as unknown as SQLiteDatabase);

    await expect(service.createOperation({ ...validSetup, inputs: [] }, 'device-1')).rejects.toThrow(
      'ao menos um insumo',
    );
    expect(database.runAsync).not.toHaveBeenCalled();
  });

  it('accepts an operation without machine name', async () => {
    const database = createMockSprayingSQLiteDatabase();
    const service = createSprayingSqliteService(database as unknown as SQLiteDatabase);

    const operation = await service.createOperation({ ...validSetup, machineName: '' }, 'device-1');

    expect(operation.machine_name).toBe('');
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO local_spraying_operations'),
      expect.arrayContaining(['']),
    );
  });

  it('deletes the complete local aggregate in one transaction', async () => {
    const database = createMockSprayingSQLiteDatabase();
    const service = createSprayingSqliteService(database as unknown as SQLiteDatabase);

    await service.deleteOperation(sprayingOperationFixture.id);

    expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(database.runAsync).toHaveBeenNthCalledWith(
      1,
      'DELETE FROM local_spraying_confirmed_plants WHERE field_operation_local_id = ?',
      [sprayingOperationFixture.id],
    );
    expect(database.runAsync).toHaveBeenNthCalledWith(6, 'DELETE FROM local_spraying_operations WHERE id = ?', [
      sprayingOperationFixture.id,
    ]);
    expect(database.runAsync).not.toHaveBeenCalledWith(expect.stringContaining('local_plants'), expect.any(Array));
  });

  it('resets persisted route points before DEV route simulation', async () => {
    const database = createMockSprayingSQLiteDatabase();
    const service = createSprayingSqliteService(database as unknown as SQLiteDatabase);

    await service.resetTrackPointsForSimulation(sprayingOperationFixture.id);

    expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(database.runAsync).toHaveBeenNthCalledWith(
      1,
      'DELETE FROM local_spraying_routes WHERE field_operation_local_id = ?',
      [sprayingOperationFixture.id],
    );
    expect(database.runAsync).toHaveBeenNthCalledWith(
      2,
      'DELETE FROM local_spraying_track_points WHERE field_operation_local_id = ?',
      [sprayingOperationFixture.id],
    );
  });

  it('persists manual additions and removals transactionally', async () => {
    const database = createMockSprayingSQLiteDatabase();
    database.getFirstAsync.mockResolvedValue(null);
    database.getAllAsync.mockResolvedValue([]);
    const service = createSprayingSqliteService(database as unknown as SQLiteDatabase);

    await service.setPlantConfirmed({
      operationId: sprayingOperationFixture.id,
      plantId: 'plant-1',
      confirmed: true,
      deviceId: 'device-1',
    });
    await service.setPlantConfirmed({
      operationId: sprayingOperationFixture.id,
      plantId: 'plant-1',
      confirmed: false,
      deviceId: 'device-1',
    });

    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('local_spraying_confirmed_plants'),
      expect.any(Array),
    );
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM local_spraying_confirmed_plants'),
      expect.any(Array),
    );
  });

  it('keeps automatic candidates counted when one is removed from confirmation', async () => {
    const database = createMockSprayingSQLiteDatabase();
    database.getFirstAsync
      .mockResolvedValueOnce({
        id: 'candidate-1',
        field_operation_local_id: sprayingOperationFixture.id,
        plant_id: 'plant-1',
        match_source: 'auto_matched',
        review_status: 'confirmed',
      })
      .mockResolvedValueOnce({ count: 20 })
      .mockResolvedValueOnce({ count: 19 });
    const service = createSprayingSqliteService(database as unknown as SQLiteDatabase);

    await service.setPlantConfirmed({
      operationId: sprayingOperationFixture.id,
      plantId: 'plant-1',
      confirmed: false,
      deviceId: 'device-1',
    });

    expect(database.getFirstAsync).toHaveBeenCalledWith(expect.stringContaining("match_source = 'auto_matched'"), [
      sprayingOperationFixture.id,
    ]);
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('SET candidate_plants_count = ?, confirmed_plants_count = ?'),
      [20, 19, expect.any(String), sprayingOperationFixture.id],
    );
  });

  it('gates sync payload creation to reviewed operations', async () => {
    const database = createMockSprayingSQLiteDatabase();
    database.getFirstAsync.mockResolvedValue(sprayingOperationFixture);
    database.getAllAsync.mockResolvedValue([]);
    const service = createSprayingSqliteService(database as unknown as SQLiteDatabase);

    await expect(service.buildSyncPayload(sprayingOperationFixture.id)).rejects.toThrow('revisada');
  });

  it('stores aggregate sync success in one transaction', async () => {
    const database = createMockSprayingSQLiteDatabase();
    const service = createSprayingSqliteService(database as unknown as SQLiteDatabase);

    await service.markSynced(sprayingOperationFixture.id, {
      field_operation_id: 'remote-operation',
      route_id: 'remote-route',
      track_points_count: 2,
      inputs_count: 1,
      confirmed_plants_count: 1,
      synced_at: '2026-06-07T14:00:00.000Z',
    });

    expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("lifecycle_status = 'synced'"),
      expect.arrayContaining(['remote-operation']),
    );
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('local_spraying_confirmed_plants'),
      expect.any(Array),
    );
  });

  it('preserves the aggregate and records retryable sync errors', async () => {
    const database = createMockSprayingSQLiteDatabase();
    const service = createSprayingSqliteService(database as unknown as SQLiteDatabase);

    await service.markSyncError(sprayingOperationFixture.id, 'network unavailable');

    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("lifecycle_status = 'sync_error'"),
      expect.arrayContaining(['network unavailable', sprayingOperationFixture.id]),
    );
  });
});
