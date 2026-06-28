import { supabase } from '@/data/services/supabase/supabase-connection';
import { fieldWorkOptionsService } from './field-work-options-service';

jest.mock('@/data/services/supabase/supabase-connection', () => ({
  supabase: { from: jest.fn() },
}));

const mockSupabase = supabase as unknown as { from: jest.Mock };

function createSelectOrderResponse(data: unknown, error: unknown = null) {
  return {
    order: jest.fn().mockResolvedValue({ data, error }),
    select: jest.fn().mockReturnThis(),
  };
}

describe('fieldWorkOptionsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['getZones', 'zones', 'id,name,description'],
    ['getOccurrenceTypes', 'occurrence_types', 'id,code,name'],
    ['getVarieties', 'varieties', 'id,name,description'],
  ] as const)('loads and orders %s', async (method, table, selection) => {
    const query = createSelectOrderResponse([{ id: 'item-1', name: 'Item' }]);
    mockSupabase.from.mockReturnValue(query);

    await expect(fieldWorkOptionsService[method]()).resolves.toEqual([{ id: 'item-1', name: 'Item' }]);
    expect(mockSupabase.from).toHaveBeenCalledWith(table);
    expect(query.select).toHaveBeenCalledWith(selection);
    expect(query.order).toHaveBeenCalledWith('name');
  });

  it('normalizes null data to an empty array', async () => {
    mockSupabase.from.mockReturnValue(createSelectOrderResponse(null));

    await expect(fieldWorkOptionsService.getZones()).resolves.toEqual([]);
  });

  it('throws Supabase request errors', async () => {
    mockSupabase.from.mockReturnValue(createSelectOrderResponse(null, { message: 'network failed' }));

    await expect(fieldWorkOptionsService.getOccurrenceTypes()).rejects.toThrow('network failed');
  });
});
