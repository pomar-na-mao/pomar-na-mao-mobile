import type {
  InspectionFilter,
  InspectionPlantRow,
  OccurrenceTypeOption,
  SyncInspectionPayload,
  SyncManualInspectionResult,
  VarietyOption,
  ZoneOption,
} from '@/domain/models/inspection';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase-connection';

export interface SupabaseInspectionFilterOptions {
  zones: ZoneOption[];
  occurrenceTypes: OccurrenceTypeOption[];
  varieties: VarietyOption[];
}

class InspectionSupabaseService {
  async getFilterOptions(): Promise<{ data: SupabaseInspectionFilterOptions | null; error: PostgrestError | null }> {
    const [zonesResponse, occurrencesResponse, varietiesResponse] = await Promise.all([
      supabase.from('zones').select('id,name,description').order('name'),
      supabase.from('occurrence_types').select('id,code,name').order('name'),
      supabase.from('varieties').select('id,name,description').order('name'),
    ]);

    const error = zonesResponse.error ?? occurrencesResponse.error ?? varietiesResponse.error;

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        zones: zonesResponse.data ?? [],
        occurrenceTypes: occurrencesResponse.data ?? [],
        varieties: varietiesResponse.data ?? [],
      },
      error: null,
    };
  }

  async getInspectionPlants(
    filters: InspectionFilter,
  ): Promise<{ data: InspectionPlantRow[] | null; error: PostgrestError | null }> {
    return await supabase.rpc('get_inspection_plants', {
      p_zone_id: filters.zoneId ?? null,
      p_occurrence_type_id: filters.occurrenceTypeId ?? null,
    });
  }

  async syncManualInspection(
    payload: SyncInspectionPayload,
  ): Promise<{ data: SyncManualInspectionResult[] | null; error: PostgrestError | null }> {
    return await supabase.rpc('sync_manual_inspection', {
      p_payload: payload,
    });
  }
}

export const inspectionSupabaseService = new InspectionSupabaseService();
