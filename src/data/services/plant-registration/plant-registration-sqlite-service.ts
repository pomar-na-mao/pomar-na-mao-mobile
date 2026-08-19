import type {
  CreatePlantRegistrationParams,
  LocalPlantRegistration,
  SyncNewPlantResult,
} from '@/domain/models/plant-registration';
import { getPersistentDeviceId } from '@/shared/helpers/device-id';
import { randomUUID } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

interface PlantRegistrationSqliteDependencies {
  createId?: () => string;
  getDeviceId?: () => Promise<string>;
  now?: () => string;
}

export function createPlantRegistrationSqliteService(
  database: SQLiteDatabase,
  dependencies: PlantRegistrationSqliteDependencies = {},
) {
  const createId = dependencies.createId ?? randomUUID;
  const getDeviceId = dependencies.getDeviceId ?? getPersistentDeviceId;
  const now = dependencies.now ?? (() => new Date().toISOString());

  async function create(params: CreatePlantRegistrationParams): Promise<LocalPlantRegistration> {
    const id = createId();
    const deviceId = await getDeviceId();
    const timestamp = now();
    const registration: LocalPlantRegistration = {
      id,
      local_id: id,
      remote_plant_id: null,
      latitude: params.latitude,
      longitude: params.longitude,
      gps_accuracy_m: params.gpsAccuracyM,
      gps_timestamp: params.gpsTimestamp,
      variety_id: params.varietyId,
      variety_name: params.varietyName,
      zone_id: params.zoneId,
      zone_name: params.zoneName,
      planting_date: params.plantingDate,
      is_dead: 0,
      is_new: 1,
      non_existent: 0,
      created_at: timestamp,
      updated_at: timestamp,
      sync_status: 'pending_create',
      device_id: deviceId,
      sync_error: null,
      synced_at: null,
      record_origin: 'local_registration',
    };

    await database.runAsync(
      `INSERT INTO local_plants (
        id, local_id, remote_plant_id, latitude, longitude, gps_accuracy_m, gps_timestamp,
        variety_id, variety_name, zone_id, zone_name, planting_date,
        mass, harvest, life_of_the_tree, description,
        is_dead, is_new, non_existent, created_at, updated_at,
        sync_status, device_id, sync_error, synced_at, record_origin
      ) VALUES (
        ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        NULL, NULL, NULL, NULL, 0, 1, 0, ?, ?,
        'pending_create', ?, NULL, NULL, 'local_registration'
      )`,
      [
        registration.id,
        registration.local_id,
        registration.latitude,
        registration.longitude,
        registration.gps_accuracy_m ?? null,
        registration.gps_timestamp ?? null,
        registration.variety_id,
        registration.variety_name ?? null,
        registration.zone_id,
        registration.zone_name ?? null,
        registration.planting_date,
        registration.created_at,
        registration.updated_at,
        registration.device_id,
      ],
    );

    return registration;
  }

  async function list(): Promise<LocalPlantRegistration[]> {
    return database.getAllAsync<LocalPlantRegistration>(
      `SELECT id, local_id, remote_plant_id, latitude, longitude, gps_accuracy_m, gps_timestamp,
              variety_id, variety_name, zone_id, zone_name, planting_date,
              is_dead, is_new, non_existent, created_at, updated_at,
              sync_status, device_id, sync_error, synced_at, record_origin
       FROM local_plants
       WHERE record_origin = 'local_registration'
       ORDER BY created_at DESC`,
    );
  }

  async function findById(id: string): Promise<LocalPlantRegistration | null> {
    return database.getFirstAsync<LocalPlantRegistration>(
      `SELECT id, local_id, remote_plant_id, latitude, longitude, gps_accuracy_m, gps_timestamp,
              variety_id, variety_name, zone_id, zone_name, planting_date,
              is_dead, is_new, non_existent, created_at, updated_at,
              sync_status, device_id, sync_error, synced_at, record_origin
       FROM local_plants
       WHERE id = ? AND record_origin = 'local_registration'`,
      [id],
    );
  }

  async function deleteLocal(id: string): Promise<boolean> {
    const result = await database.runAsync(
      `DELETE FROM local_plants WHERE id = ? AND record_origin = 'local_registration'`,
      [id],
    );
    return result.changes > 0;
  }

  async function deleteAllLocal(): Promise<number> {
    const result = await database.runAsync(`DELETE FROM local_plants WHERE record_origin = 'local_registration'`);
    return result.changes;
  }

  async function markSyncing(id: string): Promise<boolean> {
    const result = await database.runAsync(
      `UPDATE local_plants
       SET sync_status = 'syncing', sync_error = NULL, updated_at = ?
       WHERE id = ?
         AND record_origin = 'local_registration'
         AND sync_status IN ('pending_create', 'error')`,
      [now(), id],
    );
    return result.changes > 0;
  }

  async function markSyncError(id: string, message: string): Promise<void> {
    await database.runAsync(
      `UPDATE local_plants
       SET sync_status = 'error', sync_error = ?, updated_at = ?
       WHERE id = ? AND record_origin = 'local_registration'`,
      [message, now(), id],
    );
  }

  async function markSynced(id: string, result: SyncNewPlantResult): Promise<void> {
    await database.runAsync(
      `UPDATE local_plants
       SET remote_plant_id = ?, sync_status = 'synced', sync_error = NULL,
           synced_at = ?, created_at = ?, updated_at = ?
       WHERE id = ? AND record_origin = 'local_registration'`,
      [result.plant_id, result.synced_at, result.created_at, result.updated_at, id],
    );
  }

  async function recoverInterruptedSyncs(): Promise<void> {
    await database.runAsync(
      `UPDATE local_plants
       SET sync_status = 'error', sync_error = 'Sincronização interrompida. Tente novamente.'
       WHERE record_origin = 'local_registration' AND sync_status = 'syncing'`,
    );
  }

  return {
    create,
    deleteAllLocal,
    deleteLocal,
    findById,
    list,
    markSynced,
    markSyncError,
    markSyncing,
    recoverInterruptedSyncs,
  };
}

export type PlantRegistrationSqliteService = ReturnType<typeof createPlantRegistrationSqliteService>;
