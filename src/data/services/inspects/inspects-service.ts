import type { RoutinePlants, SupabaseRoutine } from '@/domain/models/inspect-routines/inspect-routines.model';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase-connection';

class InspectsService {
  async createANewInspectRoutineWithPlants(
    newInspectRoutine: Partial<SupabaseRoutine>,
    enrichedPlantData: Partial<PlantData>[],
  ): Promise<PostgrestSingleResponse<RoutinePlants[]>> {
    return await supabase.rpc('insert_inspect_routine_with_plants', {
      p_routine_data: newInspectRoutine,
      p_plants_data: enrichedPlantData,
    });
  }

  async getNearestPlant(lat: number, lon: number): Promise<PostgrestSingleResponse<string>> {
    return await supabase.rpc('get_nearest_plant', {
      req_lat: lat,
      req_lon: lon,
    });
  }

  async updatePlant(id: string, data: Partial<PlantData>) {
    return await supabase.from('plants').update(data).eq('id', id);
  }

  async approveInspectAnnotation(id: string): Promise<PostgrestSingleResponse<string>> {
    return await supabase.rpc('approve_inspect_annotation', {
      p_annotation_id: id,
    });
  }
}

export const inspectsService = new InspectsService();
