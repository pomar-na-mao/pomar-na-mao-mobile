import type { InspectionPlantRow } from '@/domain/models/inspection';
import {
  createPostgrestError,
  inspectionFilter,
  inspectionFilterOptions,
  inspectionPlantRow,
  syncManualInspectionResult,
} from '@/test/inspection/fixtures';

import { inspectionSupabaseService } from '@/data/services/inspection/inspection-supabase-service';
import { groupInspectionPlantRows, inspectionRepository } from './inspection-repository';

jest.mock('@/data/services/inspection/inspection-supabase-service', () => ({
  inspectionSupabaseService: {
    getFilterOptions: jest.fn(),
    getInspectionPlants: jest.fn(),
    syncManualInspection: jest.fn(),
  },
}));

const mockInspectionSupabaseService = inspectionSupabaseService as unknown as {
  getFilterOptions: jest.Mock;
  getInspectionPlants: jest.Mock;
  syncManualInspection: jest.Mock;
};

describe('groupInspectionPlantRows', () => {
  it('groups rows by plant, de-duplicates occurrences, and applies default local flags', () => {
    const rows: InspectionPlantRow[] = [
      inspectionPlantRow,
      { ...inspectionPlantRow },
      {
        latitude: -23.2,
        longitude: -46.2,
        occurrence_code: null,
        occurrence_name: null,
        occurrence_type_id: null,
        plant_id: 'plant-without-occurrence',
      },
    ];

    const plants = groupInspectionPlantRows(rows);

    expect(plants).toHaveLength(2);
    expect(plants[0]).toMatchObject({
      distanceMeters: null,
      isChanged: false,
      isNearest: false,
      plantId: inspectionPlantRow.plant_id,
    });
    expect(plants[0].occurrences).toEqual([
      {
        code: inspectionPlantRow.occurrence_code,
        name: inspectionPlantRow.occurrence_name,
        observedAt: inspectionPlantRow.occurrence_observed_at,
        occurrenceTypeId: inspectionPlantRow.occurrence_type_id,
        severity: inspectionPlantRow.occurrence_severity,
        status: inspectionPlantRow.occurrence_status,
      },
    ]);
    expect(plants[1].occurrences).toEqual([]);
  });

  it('defaults missing occurrence status to open', () => {
    const plants = groupInspectionPlantRows([{ ...inspectionPlantRow, occurrence_status: null }]);

    expect(plants[0].occurrences[0].status).toBe('open');
  });
});

describe('inspectionRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes filter options from the Supabase service', async () => {
    mockInspectionSupabaseService.getFilterOptions.mockResolvedValue({
      data: inspectionFilterOptions,
      error: null,
    });

    const result = await inspectionRepository.getFilterOptions();

    expect(result.error).toBeNull();
    expect(result.data).toEqual(inspectionFilterOptions);
  });

  it('returns null data when filter option loading fails', async () => {
    const error = createPostgrestError('failed');
    mockInspectionSupabaseService.getFilterOptions.mockResolvedValue({ data: null, error });

    await expect(inspectionRepository.getFilterOptions()).resolves.toEqual({ data: null, error });
  });

  it('normalizes inspection plant rows into grouped plants', async () => {
    mockInspectionSupabaseService.getInspectionPlants.mockResolvedValue({
      data: [inspectionPlantRow],
      error: null,
    });

    const result = await inspectionRepository.getInspectionPlants(inspectionFilter);

    expect(mockInspectionSupabaseService.getInspectionPlants).toHaveBeenCalledWith(inspectionFilter);
    expect(result.data?.[0].plantId).toBe(inspectionPlantRow.plant_id);
    expect(result.data?.[0].occurrences).toHaveLength(1);
  });

  it('unwraps the first sync result row', async () => {
    mockInspectionSupabaseService.syncManualInspection.mockResolvedValue({
      data: [syncManualInspectionResult],
      error: null,
    });

    const result = await inspectionRepository.syncManualInspection({
      deviceId: 'device-1',
      localInspectionId: 'inspection-1',
      plantsChanged: [],
      startedAt: '2026-05-30T12:00:00.000Z',
    });

    expect(result).toEqual({ data: syncManualInspectionResult, error: null });
  });
});
