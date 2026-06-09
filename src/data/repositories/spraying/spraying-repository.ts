import {
  createSprayingSqliteService,
  type SprayingSqliteService,
} from '@/data/services/spraying/spraying-sqlite-service';
import {
  normalizeSprayingSyncResult,
  sprayingSupabaseService,
} from '@/data/services/spraying/spraying-supabase-service';
import type { SprayingPlant, SyncReviewedSprayingPayload } from '@/domain/models/spraying';
import type { SQLiteDatabase } from 'expo-sqlite';

export function createSprayingRepository(database: SQLiteDatabase) {
  const local = createSprayingSqliteService(database);

  return {
    local,
    async getZones() {
      return sprayingSupabaseService.getZones();
    },
    async getZonePlants(zoneId: string) {
      const { data, error } = await sprayingSupabaseService.getZonePlants(zoneId);
      if (!data) {
        return { data: null, error };
      }

      const plantsById = new Map<string, SprayingPlant>();
      for (const row of data) {
        if (!plantsById.has(row.plant_id)) {
          plantsById.set(row.plant_id, {
            plantId: row.plant_id,
            latitude: row.latitude,
            longitude: row.longitude,
            zoneId: row.zone_id ?? null,
            zoneName: row.zone_name ?? null,
            varietyId: row.variety_id ?? null,
            varietyName: row.variety_name ?? null,
            reviewStatus: null,
            matchSource: null,
            distanceMeters: null,
          });
        }
      }

      return { data: Array.from(plantsById.values()), error };
    },
    async syncReviewedOperation(payload: SyncReviewedSprayingPayload) {
      const { data, error } = await sprayingSupabaseService.syncReviewedOperation(payload);

      return {
        data: normalizeSprayingSyncResult(data),
        error,
      };
    },
  };
}

export interface SprayingRepository {
  local: SprayingSqliteService;
  getZones: ReturnType<typeof createSprayingRepository>['getZones'];
  getZonePlants: ReturnType<typeof createSprayingRepository>['getZonePlants'];
  syncReviewedOperation: ReturnType<typeof createSprayingRepository>['syncReviewedOperation'];
}
