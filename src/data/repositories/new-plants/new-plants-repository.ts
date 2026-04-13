import { supabase } from '@/data/services/supabase/supabase-connection';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';

export interface SupabaseNewPlant {
  latitude: number | null;
  longitude: number | null;
  gps_timestamp: number | null;
  created_at: string;
  region: string | null;
}

class NewPlantsRepository {
  async insert(newPlants: SupabaseNewPlant[]): Promise<PostgrestSingleResponse<null>> {
    return await supabase.from('new_plants').insert(newPlants);
  }
}

export const newPlantsRepository = new NewPlantsRepository();
