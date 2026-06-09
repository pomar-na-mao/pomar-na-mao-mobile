import { sprayingSupabaseService } from '@/data/services/spraying/spraying-supabase-service';
import { createSprayingRepository } from './spraying-repository';

jest.mock('@/data/services/spraying/spraying-supabase-service', () => ({
  normalizeSprayingSyncResult: jest.fn(),
  sprayingSupabaseService: {
    getZonePlants: jest.fn(),
    getZones: jest.fn(),
    syncReviewedOperation: jest.fn(),
  },
}));

jest.mock('@/data/services/spraying/spraying-sqlite-service', () => ({
  createSprayingSqliteService: jest.fn(() => ({})),
}));

describe('spraying repository', () => {
  it('deduplicates plant rows returned by the inspection RPC', async () => {
    jest.mocked(sprayingSupabaseService.getZonePlants).mockResolvedValue({
      data: [
        {
          plant_id: 'plant-1',
          latitude: -20,
          longitude: -47,
          zone_id: 'zone-1',
          zone_name: 'Talhao 1',
          variety_id: 1,
          variety_name: 'Gala',
          occurrence_type_id: 'occurrence-1',
        },
        {
          plant_id: 'plant-1',
          latitude: -20,
          longitude: -47,
          zone_id: 'zone-1',
          zone_name: 'Talhao 1',
          variety_id: 1,
          variety_name: 'Gala',
          occurrence_type_id: 'occurrence-2',
        },
      ],
      error: null,
    });

    const repository = createSprayingRepository({} as never);
    const result = await repository.getZonePlants('zone-1');

    expect(result.data).toEqual([
      expect.objectContaining({
        plantId: 'plant-1',
        zoneId: 'zone-1',
        varietyName: 'Gala',
      }),
    ]);
  });
});
