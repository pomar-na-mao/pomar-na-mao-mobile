import { syncAnnotationPayload } from '@/test/annotation/fixtures';
import { supabase } from '../supabase/supabase-connection';
import { annotationSupabaseService, normalizeAnnotationSyncResult } from './annotation-supabase-service';

jest.mock('../supabase/supabase-connection', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockSupabase = supabase as unknown as {
  from: jest.Mock;
  rpc: jest.Mock;
};

function createSelectOrderResponse(data: unknown, error: unknown = null) {
  return {
    order: jest.fn().mockResolvedValue({ data, error }),
    select: jest.fn().mockReturnThis(),
  };
}

describe('annotationSupabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads occurrence type and zone options', async () => {
    const occurrencesQuery = createSelectOrderResponse([{ code: 'PST', id: 'occurrence-1', name: 'Praga' }]);
    const zonesQuery = createSelectOrderResponse([{ id: 'zone-1', name: 'Talhao 1' }]);
    mockSupabase.from.mockReturnValueOnce(occurrencesQuery).mockReturnValueOnce(zonesQuery);

    const result = await annotationSupabaseService.getOptions();

    expect(mockSupabase.from).toHaveBeenNthCalledWith(1, 'occurrence_types');
    expect(mockSupabase.from).toHaveBeenNthCalledWith(2, 'zones');
    expect(result.data?.occurrenceTypes).toHaveLength(1);
    expect(result.data?.zones).toHaveLength(1);
  });

  it('maps annotation sync payload to create_occurrence_annotation RPC', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: [
        {
          field_operation_id: 'remote-operation-1',
          occurrence_id: 'remote-occurrence-1',
          plant_id: 'remote-plant-1',
        },
      ],
      error: null,
    });

    const response = await annotationSupabaseService.syncAnnotation(syncAnnotationPayload);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('create_occurrence_annotation', {
      p_assigned_distance_meters: syncAnnotationPayload.assignedDistanceMeters,
      p_assignment_method: 'nearest_plant',
      p_assignment_status: 'confirmed',
      p_device_id: syncAnnotationPayload.deviceId,
      p_field_operation_local_id: syncAnnotationPayload.localOperationId,
      p_gps_accuracy_m: syncAnnotationPayload.gpsAccuracyM,
      p_latitude: syncAnnotationPayload.latitude,
      p_local_id: syncAnnotationPayload.localAnnotationId,
      p_longitude: syncAnnotationPayload.longitude,
      p_max_distance_meters: null,
      p_notes: syncAnnotationPayload.notes,
      p_observed_at: syncAnnotationPayload.observedAt,
      p_occurrence_type_id: syncAnnotationPayload.occurrenceTypeId,
      p_plant_id: null,
      p_severity: syncAnnotationPayload.severity,
    });
    expect(response.data?.[0]?.operation_identity_mode).toBe('explicit');
  });

  it('retries without operation identity when the remote RPC signature is stale', async () => {
    mockSupabase.rpc
      .mockResolvedValueOnce({
        data: null,
        error: {
          code: 'PGRST202',
          details: 'Searched for the function public.create_occurrence_annotation',
          hint: null,
          message:
            'Could not find the function public.create_occurrence_annotation(..., p_field_operation_local_id, ...)',
        },
      })
      .mockResolvedValueOnce({
        data: [
          {
            field_operation_id: 'remote-operation-legacy',
            occurrence_id: 'remote-occurrence-legacy',
            plant_id: 'remote-plant-legacy',
          },
        ],
        error: null,
      });

    const response = await annotationSupabaseService.syncAnnotation(syncAnnotationPayload);

    expect(mockSupabase.rpc).toHaveBeenNthCalledWith(
      1,
      'create_occurrence_annotation',
      expect.objectContaining({
        p_field_operation_local_id: syncAnnotationPayload.localOperationId,
      }),
    );
    expect(mockSupabase.rpc).toHaveBeenNthCalledWith(
      2,
      'create_occurrence_annotation',
      expect.not.objectContaining({
        p_field_operation_local_id: expect.anything(),
      }),
    );
    expect(response.data?.[0]?.operation_identity_mode).toBe('legacy');
  });

  it('normalizes table and object RPC responses', () => {
    const result = {
      field_operation_id: 'remote-operation',
      occurrence_id: 'remote-occurrence',
      plant_id: 'remote-plant',
    };

    expect(normalizeAnnotationSyncResult([result])).toEqual(result);
    expect(normalizeAnnotationSyncResult(result)).toEqual(result);
    expect(normalizeAnnotationSyncResult(null)).toBeNull();
  });
});
