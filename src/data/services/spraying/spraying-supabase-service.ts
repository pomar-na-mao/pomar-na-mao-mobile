import { supabase } from '@/data/services/supabase/supabase-connection';
import type { InspectionPlantRow } from '@/domain/models/inspection';
import type {
  SprayingZoneOption,
  SyncReviewedSprayingPayload,
  SyncReviewedSprayingResult,
} from '@/domain/models/spraying';
import type { PostgrestError } from '@supabase/supabase-js';

class SprayingSupabaseService {
  async getZones(): Promise<{ data: SprayingZoneOption[] | null; error: PostgrestError | null }> {
    return await supabase.from('zones').select('id,name,description').order('name');
  }

  async getZonePlants(zoneId: string): Promise<{ data: InspectionPlantRow[] | null; error: PostgrestError | null }> {
    return await supabase.rpc('get_inspection_plants', {
      p_zone_id: zoneId,
      p_occurrence_type_id: null,
    });
  }

  async syncReviewedOperation(payload: SyncReviewedSprayingPayload) {
    return supabase.rpc('sync_reviewed_spraying_operation', {
      p_payload: payload,
    });
  }
}

export const sprayingSupabaseService = new SprayingSupabaseService();

export function normalizeSprayingSyncResult(data: unknown): SyncReviewedSprayingResult | null {
  const result = Array.isArray(data) ? data[0] : data;
  if (!result || typeof result !== 'object' || !('field_operation_id' in result)) {
    return null;
  }

  return result as SyncReviewedSprayingResult;
}
