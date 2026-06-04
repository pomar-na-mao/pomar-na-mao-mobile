import { inspectionFilter, inspectionOccurrence, syncInspectionPayload } from '@/test/inspection/fixtures';

import { supabase } from '../supabase/supabase-connection';
import { inspectionSupabaseService } from './inspection-supabase-service';

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

describe('inspectionSupabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads filter options from zones, occurrence types, and varieties', async () => {
    const zonesQuery = createSelectOrderResponse([{ id: 'zone-1', name: 'Talhao 1' }]);
    const occurrencesQuery = createSelectOrderResponse([{ code: 'PST', id: 'occurrence-1', name: 'Praga' }]);
    const varietiesQuery = createSelectOrderResponse([{ id: 10, name: 'Gala' }]);
    mockSupabase.from
      .mockReturnValueOnce(zonesQuery)
      .mockReturnValueOnce(occurrencesQuery)
      .mockReturnValueOnce(varietiesQuery);

    const result = await inspectionSupabaseService.getFilterOptions();

    expect(mockSupabase.from).toHaveBeenNthCalledWith(1, 'zones');
    expect(mockSupabase.from).toHaveBeenNthCalledWith(2, 'occurrence_types');
    expect(mockSupabase.from).toHaveBeenNthCalledWith(3, 'varieties');
    expect(zonesQuery.select).toHaveBeenCalledWith('id,name,description');
    expect(occurrencesQuery.select).toHaveBeenCalledWith('id,code,name');
    expect(varietiesQuery.select).toHaveBeenCalledWith('id,name,description');
    expect(zonesQuery.order).toHaveBeenCalledWith('name');
    expect(result).toEqual({
      data: {
        occurrenceTypes: [{ code: 'PST', id: 'occurrence-1', name: 'Praga' }],
        varieties: [{ id: 10, name: 'Gala' }],
        zones: [{ id: 'zone-1', name: 'Talhao 1' }],
      },
      error: null,
    });
  });

  it('returns the first filter option error and no data', async () => {
    const error = { message: 'zones failed' };
    mockSupabase.from
      .mockReturnValueOnce(createSelectOrderResponse(null, error))
      .mockReturnValueOnce(createSelectOrderResponse([{ id: 'occurrence-1' }]))
      .mockReturnValueOnce(createSelectOrderResponse([{ id: 10 }]));

    await expect(inspectionSupabaseService.getFilterOptions()).resolves.toEqual({ data: null, error });
  });

  it('calls get_inspection_plants with nullable filter parameters', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

    await inspectionSupabaseService.getInspectionPlants(inspectionFilter);
    await inspectionSupabaseService.getInspectionPlants({});

    expect(mockSupabase.rpc).toHaveBeenNthCalledWith(1, 'get_inspection_plants', {
      p_occurrence_type_id: inspectionFilter.occurrenceTypeId,
      p_zone_id: inspectionFilter.zoneId,
    });
    expect(mockSupabase.rpc).toHaveBeenNthCalledWith(2, 'get_inspection_plants', {
      p_occurrence_type_id: null,
      p_zone_id: null,
    });
  });

  it('calls sync_manual_inspection with the payload parameter', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

    await inspectionSupabaseService.syncManualInspection(syncInspectionPayload);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('sync_manual_inspection', {
      p_payload: syncInspectionPayload,
    });
  });

  it('passes remove occurrence changes through to sync_manual_inspection', async () => {
    const removePayload = {
      ...syncInspectionPayload,
      plantsChanged: [
        {
          plantId: 'plant-1',
          changes: [
            {
              ...syncInspectionPayload.plantsChanged[0].changes[0],
              changeType: 'remove_occurrence' as const,
              newValue: undefined,
              previousValue: inspectionOccurrence,
            },
          ],
        },
      ],
    };
    mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

    await inspectionSupabaseService.syncManualInspection(removePayload);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('sync_manual_inspection', {
      p_payload: removePayload,
    });
  });
});
