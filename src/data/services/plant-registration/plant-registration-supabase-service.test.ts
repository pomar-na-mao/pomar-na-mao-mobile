import { supabase } from '@/data/services/supabase/supabase-connection';
import {
  buildSyncNewPlantRpcParams,
  normalizeSyncNewPlantResult,
  plantRegistrationSupabaseService,
} from './plant-registration-supabase-service';

const payload = {
  localId: 'local-1',
  deviceId: 'device-1',
  latitude: -23.5,
  longitude: -46.6,
  gpsAccuracyM: 3,
  gpsTimestamp: 1_700_000_000_000,
  varietyId: 7,
  zoneId: 'zone-1',
  plantingDate: '2026-08-01T00:00:00.000Z',
};

describe('plant registration supabase service', () => {
  it('maps the exact sync_new_plant RPC payload', async () => {
    jest.mocked(supabase.rpc).mockResolvedValue({
      data: [{ plant_id: 'remote-1', created_at: 'created', updated_at: 'updated', synced_at: 'synced' }],
      error: null,
    } as never);

    await plantRegistrationSupabaseService.sync(payload);

    expect(supabase.rpc).toHaveBeenCalledWith('sync_new_plant', buildSyncNewPlantRpcParams(payload));
    expect(buildSyncNewPlantRpcParams(payload).p_payload).toEqual({
      deviceId: payload.deviceId,
      gpsAccuracyM: payload.gpsAccuracyM,
      gpsTimestamp: payload.gpsTimestamp,
      latitude: payload.latitude,
      localId: payload.localId,
      longitude: payload.longitude,
      plantingDate: payload.plantingDate,
      varietyId: payload.varietyId,
      zoneId: payload.zoneId,
    });
  });

  it('rejects incomplete RPC results', () => {
    expect(normalizeSyncNewPlantResult([{ plant_id: 'remote-1' }])).toBeNull();
    expect(
      normalizeSyncNewPlantResult([{ plant_id: 'remote-1', created_at: 'c', updated_at: 'u', synced_at: 's' }]),
    ).toEqual({ plant_id: 'remote-1', created_at: 'c', updated_at: 'u', synced_at: 's' });
  });
});
