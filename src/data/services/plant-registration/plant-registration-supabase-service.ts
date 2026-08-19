import type { SyncNewPlantPayload, SyncNewPlantResult } from '@/domain/models/plant-registration';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase-connection';

export function buildSyncNewPlantRpcParams(payload: SyncNewPlantPayload) {
  return {
    p_payload: {
      deviceId: payload.deviceId,
      gpsAccuracyM: payload.gpsAccuracyM,
      gpsTimestamp: payload.gpsTimestamp,
      latitude: payload.latitude,
      localId: payload.localId,
      longitude: payload.longitude,
      plantingDate: payload.plantingDate,
      varietyId: payload.varietyId,
      zoneId: payload.zoneId,
    },
  };
}

export function normalizeSyncNewPlantResult(data: unknown): SyncNewPlantResult | null {
  const result = Array.isArray(data) ? data[0] : data;
  if (
    !result ||
    typeof result !== 'object' ||
    !('plant_id' in result) ||
    !('created_at' in result) ||
    !('updated_at' in result) ||
    !('synced_at' in result)
  ) {
    return null;
  }
  return result as SyncNewPlantResult;
}

class PlantRegistrationSupabaseService {
  async sync(payload: SyncNewPlantPayload): Promise<{
    data: SyncNewPlantResult | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await supabase.rpc('sync_new_plant', buildSyncNewPlantRpcParams(payload));
    return { data: normalizeSyncNewPlantResult(data), error };
  }
}

export const plantRegistrationSupabaseService = new PlantRegistrationSupabaseService();
export type PlantRegistrationSupabaseServiceContract = Pick<PlantRegistrationSupabaseService, 'sync'>;
