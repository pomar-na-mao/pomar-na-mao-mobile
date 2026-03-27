import type { InspectRoutineFilter } from '@/domain/models/inspect-routines/inspect-routines-search.schema';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase-connection';

class PlantsService {
  async findAll(filters: InspectRoutineFilter | null): Promise<PostgrestSingleResponse<PlantData[]>> {
    let query = supabase.from('plants').select('*').order('created_at', { ascending: false });

    if (filters) {
      const { region, occurrence } = filters;

      if (region) {
        query = query.eq('region', region);
      }

      if (occurrence) {
        query = query.eq(occurrence, true);
      }
    }
    return await query;
  }

  async findById(id: string): Promise<PostgrestSingleResponse<PlantData>> {
    return await supabase.from('plants').select('*').eq('id', id).single();
  }

  async delete(id: string): Promise<PostgrestSingleResponse<null>> {
    return await supabase.from('plants').delete().eq('id', id);
  }

  async insert(plant: PlantData): Promise<PostgrestSingleResponse<PlantData>> {
    return await supabase.from('plants').insert([plant]).select().single();
  }
}

export const plantsService = new PlantsService();
