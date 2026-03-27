import type { InspectRoutinesSyncFilter } from '@/domain/models/inspect-routines/inspect-routines-sync.schema';
import type { SupabaseRoutine } from '@/domain/models/inspect-routines/inspect-routines.model';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase-connection';

class InspectRoutinesService {
  async findAll(filters: InspectRoutinesSyncFilter | null): Promise<PostgrestSingleResponse<SupabaseRoutine[]>> {
    let query = supabase.from('inspect_routines').select('*').order('created_at', { ascending: true });

    if (filters?.region) {
      query = query.eq('region', filters.region);
    }

    if (filters?.dateRange) {
      const _startDate = filters?.dateRange?.start;
      const _endDate = filters?.dateRange?.end;

      if (_startDate && _endDate) {
        const startDate = new Date(_startDate);
        const startDay = String(startDate.getDate()).padStart(2, '0');
        const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
        const startYear = startDate.getFullYear();

        const startDateString = `${startYear}-${startMonth}-${startDay}`;

        const endDate = new Date(_endDate);
        const endDay = String(endDate.getDate()).padStart(2, '0');
        const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
        const endYear = endDate.getFullYear();

        const endDateString = `${endYear}-${endMonth}-${endDay}`;

        query = query.gte('created_at', `${startDateString}T00:00:00`).lte('created_at', `${endDateString}T23:59:59`);
      }
    }

    return await query;
  }

  async delete(id: string): Promise<PostgrestSingleResponse<null>> {
    return await supabase.from('inspect_routines').delete().eq('id', id);
  }

  async insert(routine: Partial<SupabaseRoutine>): Promise<PostgrestSingleResponse<SupabaseRoutine>> {
    return await supabase.from('inspect_routines').insert([routine]).select().single();
  }
}

export const inspectRoutinesService = new InspectRoutinesService();
