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

function buildAnnotationRpcParams(payload: SyncAnnotationPayload, includeOperationIdentity: boolean) {
  return {
    p_assigned_distance_meters: payload.assignedDistanceMeters ?? null,
    p_assignment_method: payload.assignmentMethod ?? 'nearest_plant',
    p_assignment_status: 'confirmed',
    p_device_id: payload.deviceId ?? null,
    ...(includeOperationIdentity ? { p_field_operation_local_id: payload.localOperationId } : {}),
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
  };
}

function shouldRetryWithoutOperationIdentity(error: PostgrestError | null): boolean {
  if (!error) {
    return false;
  }

  const errorText = [error.message, error.details, error.hint].filter(Boolean).join(' ');
  return (
    error.code === 'PGRST202' &&
    errorText.includes('create_occurrence_annotation') &&
    errorText.includes('p_field_operation_local_id')
  );
}

function tagOperationIdentityMode(
  data: SyncAnnotationResult[] | null,
  mode: NonNullable<SyncAnnotationResult['operation_identity_mode']>,
): SyncAnnotationResult[] | null {
  if (!data) {
    return data;
  }

  return data.map((item) => ({
    ...item,
    operation_identity_mode: mode,
  }));
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
    const response = await supabase.rpc('create_occurrence_annotation', buildAnnotationRpcParams(payload, true));

    if (!shouldRetryWithoutOperationIdentity(response.error)) {
      return {
        ...response,
        data: tagOperationIdentityMode(response.data, 'explicit'),
      };
    }

    const legacyResponse = await supabase.rpc('create_occurrence_annotation', buildAnnotationRpcParams(payload, false));

    return {
      ...legacyResponse,
      data: tagOperationIdentityMode(legacyResponse.data, 'legacy'),
    };
  }
}

export const annotationSupabaseService = new AnnotationSupabaseService();

export function normalizeAnnotationSyncResult(data: unknown): SyncAnnotationResult | null {
  const result = Array.isArray(data) ? data[0] : data;
  if (!result || typeof result !== 'object' || !('field_operation_id' in result) || !('occurrence_id' in result)) {
    return null;
  }

  return result as SyncAnnotationResult;
}
