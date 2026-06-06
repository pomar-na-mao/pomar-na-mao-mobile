import type {
  AnnotationOccurrenceTypeOption,
  AnnotationZoneOption,
  SyncAnnotationPayload,
  SyncAnnotationResult,
} from '@/domain/models/annotation';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase-connection';

export interface SupabaseAnnotationOptions {
  occurrenceTypes: AnnotationOccurrenceTypeOption[];
  zones: AnnotationZoneOption[];
}

class AnnotationSupabaseService {
  async getOptions(): Promise<{ data: SupabaseAnnotationOptions | null; error: PostgrestError | null }> {
    const [occurrencesResponse, zonesResponse] = await Promise.all([
      supabase.from('occurrence_types').select('id,code,name').order('name'),
      supabase.from('zones').select('id,name,description').order('name'),
    ]);

    const error = occurrencesResponse.error ?? zonesResponse.error;

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        occurrenceTypes: occurrencesResponse.data ?? [],
        zones: zonesResponse.data ?? [],
      },
      error: null,
    };
  }

  async syncAnnotation(
    payload: SyncAnnotationPayload,
  ): Promise<{ data: SyncAnnotationResult[] | null; error: PostgrestError | null }> {
    return await supabase.rpc('create_occurrence_annotation', {
      p_assigned_distance_meters: payload.assignedDistanceMeters ?? null,
      p_assignment_method: payload.assignmentMethod ?? 'nearest_plant',
      p_assignment_status: 'confirmed',
      p_device_id: payload.deviceId ?? null,
      p_gps_accuracy_m: payload.gpsAccuracyM ?? null,
      p_latitude: payload.latitude,
      p_local_id: payload.localAnnotationId,
      p_longitude: payload.longitude,
      p_max_distance_meters: null,
      p_notes: payload.notes ?? null,
      p_observed_at: payload.observedAt,
      p_occurrence_type_id: payload.occurrenceTypeId,
      p_plant_id: payload.plantId,
      p_severity: payload.severity ?? null,
    });
  }
}

export const annotationSupabaseService = new AnnotationSupabaseService();
