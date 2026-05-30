import type { PlantFilter } from '@/domain/models/shared/plant-filter.model';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import type { PostgrestError, PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase-connection';

const isUuid = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

class PlantsService {
  async findAll(filters: PlantFilter | null): Promise<{ data: PlantData[] | null; error: PostgrestError | null }> {
    let query = supabase.from('plants').select('*').order('created_at', { ascending: false });

    if (filters) {
      const { region, zoneId, occurrence } = filters;
      let resolvedZoneId = zoneId ?? null;

      if (!resolvedZoneId && region) {
        if (isUuid(region)) {
          resolvedZoneId = region;
        } else {
          const { data: zone, error } = await supabase.from('zones').select('id').eq('name', region).maybeSingle();

          if (error) {
            return { data: null, error };
          }

          resolvedZoneId = zone?.id ?? null;
        }
      }

      if (resolvedZoneId) {
        query = query.eq('zone_id', resolvedZoneId);
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

  async update(id: string, plant: Partial<PlantData>): Promise<PostgrestSingleResponse<null>> {
    return await supabase.from('plants').update(plant).eq('id', id);
  }
}

export const plantsService = new PlantsService();
