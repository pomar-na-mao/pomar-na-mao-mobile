import { supabase } from '@/data/services/supabase/supabase-connection';
import type { SyncReviewedSprayingPayload } from '@/domain/models/spraying';
import { sprayingAggregateFixture } from '@/test/spraying/fixtures';
import { normalizeSprayingSyncResult, sprayingSupabaseService } from './spraying-supabase-service';

jest.mock('@/data/services/supabase/supabase-connection', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockRpc = jest.mocked(supabase.rpc);
const mockFrom = jest.mocked(supabase.from);

function createSelectOrderResponse(data: unknown, error: unknown = null) {
  return {
    order: jest.fn().mockResolvedValue({ data, error }),
    select: jest.fn().mockReturnThis(),
  };
}

const payload: SyncReviewedSprayingPayload = {
  localOperationId: 'operation-1',
  deviceId: 'device-1',
  operation: {
    zoneId: 'zone-1',
    source: 'gps_track',
    startedAt: sprayingAggregateFixture.operation.started_at,
    finishedAt: '2026-06-07T13:00:00.000Z',
    operatorName: 'Operador',
    machineName: 'Pulverizador',
    minDistanceMeters: 3.5,
    maxDistanceMeters: 9,
  },
  trackPoints: [],
  route: {
    localId: 'route-1',
    geojson: { type: 'LineString', coordinates: [] },
    distanceMeters: 10,
    startedAt: '2026-06-07T12:00:00.000Z',
    finishedAt: '2026-06-07T13:00:00.000Z',
  },
  inputs: [],
  confirmedPlants: [],
};

describe('spraying supabase service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads zones from the same Supabase source used by inspection', async () => {
    const zonesQuery = createSelectOrderResponse([{ id: 'zone-1', name: 'Talhao 1' }]);
    mockFrom.mockReturnValue(zonesQuery as never);

    await expect(sprayingSupabaseService.getZones()).resolves.toEqual({
      data: [{ id: 'zone-1', name: 'Talhao 1' }],
      error: null,
    });

    expect(mockFrom).toHaveBeenCalledWith('zones');
    expect(zonesQuery.select).toHaveBeenCalledWith('id,name,description');
    expect(zonesQuery.order).toHaveBeenCalledWith('name');
  });

  it('loads zone plants through the inspection plant RPC', async () => {
    mockRpc.mockResolvedValue({
      data: [{ plant_id: 'plant-1', latitude: -20, longitude: -47 }],
      error: null,
      count: 1,
      status: 200,
      statusText: 'OK',
    });

    await sprayingSupabaseService.getZonePlants('zone-1');

    expect(mockRpc).toHaveBeenCalledWith('get_inspection_plants', {
      p_zone_id: 'zone-1',
      p_occurrence_type_id: null,
    });
  });

  it('calls the reviewed spraying RPC with one aggregate payload', async () => {
    mockRpc.mockResolvedValue({
      data: [],
      error: null,
      count: 0,
      status: 200,
      statusText: 'OK',
    });

    await sprayingSupabaseService.syncReviewedOperation(payload);

    expect(mockRpc).toHaveBeenCalledWith('sync_reviewed_spraying_operation', {
      p_payload: payload,
    });
  });

  it('normalizes table and object RPC responses', () => {
    const result = {
      field_operation_id: 'remote-operation',
      track_points_count: 2,
      inputs_count: 1,
      confirmed_plants_count: 3,
    };

    expect(normalizeSprayingSyncResult([result])).toEqual(result);
    expect(normalizeSprayingSyncResult(result)).toEqual(result);
    expect(normalizeSprayingSyncResult(null)).toBeNull();
  });
});
