import type { OccurrenceTypeOption, VarietyOption, ZoneOption } from '@/domain/models/inspection';
import { supabase } from '@/data/services/supabase/supabase-connection';

async function requireData<T>(request: PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const { data, error } = await request;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export const fieldWorkOptionsService = {
  getOccurrenceTypes(): Promise<OccurrenceTypeOption[]> {
    return requireData(supabase.from('occurrence_types').select('id,code,name').order('name'));
  },
  getVarieties(): Promise<VarietyOption[]> {
    return requireData(supabase.from('varieties').select('id,name,description').order('name'));
  },
  getZones(): Promise<ZoneOption[]> {
    return requireData(supabase.from('zones').select('id,name,description').order('name'));
  },
};
