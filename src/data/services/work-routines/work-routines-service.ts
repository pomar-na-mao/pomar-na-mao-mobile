import type { RoutinePlants, SupabaseRoutine } from '@/domain/models/inspect-routines/inspect-routines.model';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase-connection';

class WorkRoutinesService {
  async createANewWorkRoutineWithPlants(
    newWorkRoutine: Partial<SupabaseRoutine>,
    enrichedPlantData: Partial<PlantData>[],
  ): Promise<PostgrestSingleResponse<RoutinePlants[]>> {
    return await supabase.rpc('insert_work_routine_with_plants', {
      p_routine_data: newWorkRoutine,
      p_plants_data: enrichedPlantData,
    });
  }
}

export const workRoutinesService = new WorkRoutinesService();
