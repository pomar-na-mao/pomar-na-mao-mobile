import type {
  InspectionChangeType,
  InspectionFilter,
  InspectionFilterOptions,
  InspectionListItem,
  InspectionPlant,
  LocalInspection,
  LocalInspectionChange,
  LocalInspectionLoadedPlant,
  SyncInspectionPayload,
  SyncManualInspectionResult,
} from '@/domain/models/inspection';
import { randomUUID } from 'expo-crypto';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

function nowIso() {
  return new Date().toISOString();
}

function rowToInspectionListItem(row: LocalInspection): InspectionListItem {
  return {
    id: row.id,
    startedAt: row.started_at,
    finishedAt: row.finished_at ?? null,
    zoneName: row.zone_name ?? null,
    occurrenceName: row.occurrence_name ?? null,
    plantsLoadedCount: row.plants_loaded_count,
    plantsChangedCount: row.plants_changed_count,
    status: row.status,
    syncStatus: row.sync_status,
  };
}

function rowToInspectionPlant(row: LocalInspectionLoadedPlant): InspectionPlant {
  return {
    plantId: row.plant_id,
    latitude: row.latitude,
    longitude: row.longitude,
    zoneId: row.zone_id ?? null,
    zoneName: row.zone_name ?? null,
    varietyId: row.variety_id ?? null,
    varietyName: row.variety_name ?? null,
    occurrences: JSON.parse(row.occurrences_json || '[]'),
    isNearest: row.is_nearest === 1,
    isChanged: row.is_changed === 1,
    distanceMeters: row.distance_meters ?? null,
  };
}

function parseJsonValue(value?: string | null) {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

export function useInspectionSqliteService() {
  const database = useSQLiteContext();

  async function getCachedFilterOptions(): Promise<InspectionFilterOptions> {
    const [zones, occurrenceTypes, varieties] = await Promise.all([
      database.getAllAsync<{ id: string; name: string; description?: string | null }>(
        'SELECT id, name, description FROM local_zones ORDER BY name',
      ),
      database.getAllAsync<{ id: string; code: string; name: string }>(
        'SELECT id, code, name FROM local_occurrence_types ORDER BY name',
      ),
      database.getAllAsync<{ id: number; name: string; description?: string | null }>(
        'SELECT id, name, description FROM local_varieties ORDER BY name',
      ),
    ]);

    return { zones, occurrenceTypes, varieties };
  }

  async function createInspection(filters: InspectionFilter, plants: InspectionPlant[]): Promise<LocalInspection> {
    const timestamp = nowIso();
    const id = randomUUID();
    const inspection: LocalInspection = {
      id,
      zone_id: filters.zoneId ?? null,
      zone_name: filters.zoneName ?? null,
      occurrence_type_id: filters.occurrenceTypeId ?? null,
      occurrence_code: filters.occurrenceCode ?? null,
      occurrence_name: filters.occurrenceName ?? null,
      status: 'in_progress',
      sync_status: 'pending',
      started_at: timestamp,
      finished_at: null,
      plants_loaded_count: plants.length,
      plants_changed_count: 0,
      current_latitude: null,
      current_longitude: null,
      nearest_plant_id: null,
      nearest_distance_meters: null,
      created_at: timestamp,
      updated_at: timestamp,
      remote_field_operation_id: null,
      synced_at: null,
      sync_error: null,
    };

    await database.withTransactionAsync(async () => {
      await database.runAsync(
        `INSERT INTO local_inspections (
          id, zone_id, zone_name, occurrence_type_id, occurrence_code, occurrence_name,
          status, sync_status, started_at, finished_at, plants_loaded_count, plants_changed_count,
          current_latitude, current_longitude, nearest_plant_id, nearest_distance_meters,
          created_at, updated_at, remote_field_operation_id, synced_at, sync_error
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          inspection.id,
          inspection.zone_id ?? null,
          inspection.zone_name ?? null,
          inspection.occurrence_type_id ?? null,
          inspection.occurrence_code ?? null,
          inspection.occurrence_name ?? null,
          inspection.status,
          inspection.sync_status,
          inspection.started_at,
          inspection.finished_at ?? null,
          inspection.plants_loaded_count,
          inspection.plants_changed_count,
          inspection.current_latitude ?? null,
          inspection.current_longitude ?? null,
          inspection.nearest_plant_id ?? null,
          inspection.nearest_distance_meters ?? null,
          inspection.created_at,
          inspection.updated_at,
          inspection.remote_field_operation_id ?? null,
          inspection.synced_at ?? null,
          inspection.sync_error ?? null,
        ],
      );

      for (const plant of plants) {
        await database.runAsync(
          `INSERT OR REPLACE INTO local_inspection_loaded_plants (
            id, inspection_local_id, plant_id, latitude, longitude, zone_id, zone_name,
            variety_id, variety_name, occurrences_json, is_nearest, is_changed,
            distance_meters, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `${id}:${plant.plantId}`,
            id,
            plant.plantId,
            plant.latitude,
            plant.longitude,
            plant.zoneId ?? null,
            plant.zoneName ?? null,
            plant.varietyId ?? null,
            plant.varietyName ?? null,
            JSON.stringify(plant.occurrences),
            0,
            0,
            null,
            timestamp,
            timestamp,
          ],
        );
      }
    });

    return inspection;
  }

  async function getInspectionById(id: string): Promise<LocalInspection | null> {
    return await database.getFirstAsync<LocalInspection>('SELECT * FROM local_inspections WHERE id = ?', [id]);
  }

  async function getLatestPendingInspection(): Promise<LocalInspection | null> {
    return await database.getFirstAsync<LocalInspection>(
      `SELECT * FROM local_inspections
       WHERE sync_status != 'synced'
       ORDER BY updated_at DESC, started_at DESC
       LIMIT 1`,
    );
  }

  async function getLatestInspection(): Promise<LocalInspection | null> {
    return await database.getFirstAsync<LocalInspection>(
      `SELECT * FROM local_inspections
       ORDER BY updated_at DESC, started_at DESC
       LIMIT 1`,
    );
  }

  async function listInspections(): Promise<InspectionListItem[]> {
    const rows = await database.getAllAsync<LocalInspection>(
      'SELECT * FROM local_inspections ORDER BY started_at DESC',
    );

    return rows.map(rowToInspectionListItem);
  }

  async function getLoadedPlants(inspectionId: string): Promise<InspectionPlant[]> {
    const rows = await database.getAllAsync<LocalInspectionLoadedPlant>(
      'SELECT * FROM local_inspection_loaded_plants WHERE inspection_local_id = ? ORDER BY plant_id',
      [inspectionId],
    );

    return rows.map(rowToInspectionPlant);
  }

  async function clearLoadedPlantsChangedState(inspectionId: string) {
    await database.runAsync(
      `UPDATE local_inspection_loaded_plants
       SET is_changed = 0, updated_at = ?
       WHERE inspection_local_id = ?`,
      [nowIso(), inspectionId],
    );
  }

  async function updateNearestPlant(params: {
    inspectionId: string;
    plantId: string;
    userLatitude: number;
    userLongitude: number;
    distanceMeters: number;
  }) {
    const timestamp = nowIso();

    await database.withTransactionAsync(async () => {
      await database.runAsync(
        `UPDATE local_inspections
         SET current_latitude = ?, current_longitude = ?, nearest_plant_id = ?,
             nearest_distance_meters = ?, updated_at = ?
         WHERE id = ?`,
        [
          params.userLatitude,
          params.userLongitude,
          params.plantId,
          params.distanceMeters,
          timestamp,
          params.inspectionId,
        ],
      );
      await database.runAsync(
        'UPDATE local_inspection_loaded_plants SET is_nearest = 0 WHERE inspection_local_id = ?',
        [params.inspectionId],
      );
      await database.runAsync(
        `UPDATE local_inspection_loaded_plants
         SET is_nearest = 1, distance_meters = ?, updated_at = ?
         WHERE inspection_local_id = ? AND plant_id = ?`,
        [params.distanceMeters, timestamp, params.inspectionId, params.plantId],
      );
    });
  }

  async function addInspectionChange(params: {
    inspectionId: string;
    plant: InspectionPlant;
    changeType: InspectionChangeType;
    occurrenceTypeId: string;
    occurrenceCode: string;
    occurrenceName: string;
    previousValue?: unknown;
    newValue?: unknown;
    severity?: string | null;
    notes?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    gpsAccuracyM?: number | null;
    distanceToPlantMeters?: number | null;
  }): Promise<LocalInspectionChange> {
    const timestamp = nowIso();
    const change: LocalInspectionChange = {
      id: randomUUID(),
      inspection_local_id: params.inspectionId,
      plant_id: params.plant.plantId,
      change_type: params.changeType,
      occurrence_type_id: params.occurrenceTypeId,
      occurrence_code: params.occurrenceCode,
      occurrence_name: params.occurrenceName,
      previous_value_json: params.previousValue ? JSON.stringify(params.previousValue) : null,
      new_value_json: params.newValue ? JSON.stringify(params.newValue) : null,
      severity: params.severity ?? null,
      notes: params.notes ?? null,
      latitude: params.latitude ?? null,
      longitude: params.longitude ?? null,
      gps_accuracy_m: params.gpsAccuracyM ?? null,
      distance_to_plant_meters: params.distanceToPlantMeters ?? null,
      changed_at: timestamp,
      sync_status: 'pending',
      remote_occurrence_id: null,
      sync_error: null,
    };

    await database.withTransactionAsync(async () => {
      await database.runAsync(
        `INSERT INTO local_inspection_changes (
          id, inspection_local_id, plant_id, change_type, occurrence_type_id, occurrence_code,
          occurrence_name, previous_value_json, new_value_json, severity, notes, latitude,
          longitude, gps_accuracy_m, distance_to_plant_meters, changed_at, sync_status,
          remote_occurrence_id, sync_error
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          change.id,
          change.inspection_local_id,
          change.plant_id,
          change.change_type,
          change.occurrence_type_id,
          change.occurrence_code,
          change.occurrence_name,
          change.previous_value_json ?? null,
          change.new_value_json ?? null,
          change.severity ?? null,
          change.notes ?? null,
          change.latitude ?? null,
          change.longitude ?? null,
          change.gps_accuracy_m ?? null,
          change.distance_to_plant_meters ?? null,
          change.changed_at,
          change.sync_status,
          change.remote_occurrence_id ?? null,
          change.sync_error ?? null,
        ],
      );
      await database.runAsync(
        `UPDATE local_inspection_loaded_plants
         SET is_changed = 1, updated_at = ?
         WHERE inspection_local_id = ? AND plant_id = ?`,
        [timestamp, params.inspectionId, params.plant.plantId],
      );
      await refreshChangedPlantsCount(params.inspectionId);
    });

    return change;
  }

  async function refreshChangedPlantsCount(inspectionId: string) {
    const result = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(DISTINCT plant_id) as count FROM local_inspection_changes WHERE inspection_local_id = ?',
      [inspectionId],
    );

    await database.runAsync('UPDATE local_inspections SET plants_changed_count = ?, updated_at = ? WHERE id = ?', [
      result?.count ?? 0,
      nowIso(),
      inspectionId,
    ]);
  }

  async function finishInspection(inspectionId: string) {
    await refreshChangedPlantsCount(inspectionId);
    await database.runAsync(
      `UPDATE local_inspections
       SET status = 'finished', sync_status = 'pending', finished_at = ?, updated_at = ?
       WHERE id = ?`,
      [nowIso(), nowIso(), inspectionId],
    );
  }

  async function getChanges(inspectionId: string): Promise<LocalInspectionChange[]> {
    return await database.getAllAsync<LocalInspectionChange>(
      'SELECT * FROM local_inspection_changes WHERE inspection_local_id = ? ORDER BY changed_at',
      [inspectionId],
    );
  }

  async function buildSyncPayload(inspectionId: string, deviceId: string): Promise<SyncInspectionPayload> {
    const inspection = await getInspectionById(inspectionId);

    if (!inspection) {
      throw new Error('Inspeção local não encontrada.');
    }

    const changes = await getChanges(inspectionId);
    const changesByPlant = new Map<string, LocalInspectionChange[]>();

    for (const change of changes) {
      const current = changesByPlant.get(change.plant_id) ?? [];
      current.push(change);
      changesByPlant.set(change.plant_id, current);
    }

    return {
      localInspectionId: inspection.id,
      zoneId: inspection.zone_id ?? null,
      occurrenceTypeId: inspection.occurrence_type_id ?? null,
      startedAt: inspection.started_at,
      finishedAt: inspection.finished_at ?? null,
      deviceId,
      plantsChanged: Array.from(changesByPlant.entries()).map(([plantId, plantChanges]) => ({
        plantId,
        changes: plantChanges.map((change) => ({
          localChangeId: change.id,
          changeType: change.change_type,
          occurrenceTypeId: change.occurrence_type_id,
          severity: change.severity ?? null,
          notes: change.notes ?? null,
          latitude: change.latitude ?? null,
          longitude: change.longitude ?? null,
          gpsAccuracyM: change.gps_accuracy_m ?? null,
          distanceToPlantMeters: change.distance_to_plant_meters ?? null,
          changedAt: change.changed_at,
          previousValue: parseJsonValue(change.previous_value_json),
          newValue: parseJsonValue(change.new_value_json),
        })),
      })),
    };
  }

  async function markInspectionSyncing(inspectionId: string) {
    await database.runAsync(
      `UPDATE local_inspections SET sync_status = 'syncing', sync_error = NULL, updated_at = ? WHERE id = ?`,
      [nowIso(), inspectionId],
    );
  }

  async function markInspectionSynced(inspectionId: string, result: SyncManualInspectionResult) {
    const timestamp = nowIso();
    await database.withTransactionAsync(async () => {
      await database.runAsync(
        `UPDATE local_inspections
         SET status = 'synced', sync_status = 'synced', remote_field_operation_id = ?,
             synced_at = ?, sync_error = NULL, updated_at = ?
         WHERE id = ?`,
        [result.field_operation_id, timestamp, timestamp, inspectionId],
      );
      await database.runAsync(
        `UPDATE local_inspection_changes
         SET sync_status = 'synced', sync_error = NULL
         WHERE inspection_local_id = ?`,
        [inspectionId],
      );
    });
  }

  async function markInspectionSyncError(inspectionId: string, message: string) {
    await database.runAsync(
      `UPDATE local_inspections
       SET sync_status = 'error', sync_error = ?, updated_at = ?
       WHERE id = ?`,
      [message, nowIso(), inspectionId],
    );
  }

  return useMemo(
    () => ({
      getCachedFilterOptions,
      createInspection,
      getInspectionById,
      getLatestPendingInspection,
      getLatestInspection,
      listInspections,
      getLoadedPlants,
      clearLoadedPlantsChangedState,
      updateNearestPlant,
      addInspectionChange,
      finishInspection,
      getChanges,
      buildSyncPayload,
      markInspectionSyncing,
      markInspectionSynced,
      markInspectionSyncError,
    }),
    [database],
  );
}
