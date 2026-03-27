import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase-connection';
import type { RegionVertex } from '@/domain/models/my-farm/regions.model';

class RegionsService {
  async findAll(): Promise<PostgrestSingleResponse<RegionVertex[]>> {
    return await supabase.from('regions').select('*').order('created_at', { ascending: true });
  }
}

export const regionsService = new RegionsService();
