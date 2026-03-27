import type { RoutinePlants } from '@/domain/models/inspect-routines/inspect-routines.model';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase-connection';

class InspectRoutinesPlantsService {
  async findAllByRoutineId(routineId: string): Promise<PostgrestSingleResponse<RoutinePlants[]>> {
    return await supabase.from('inspect_routines_plants').select('*').eq('routine_id', routineId);
  }

  async delete(id: string): Promise<PostgrestSingleResponse<null>> {
    return await supabase.from('inspect_routines_plants').delete().eq('id', id);
  }

  async insert(routinePlants: Partial<RoutinePlants>[]): Promise<PostgrestSingleResponse<null>> {
    return await supabase.from('inspect_routines_plants').insert(routinePlants);
  }

  async updatePlantFromInspectRoutine(
    plantId: string,
    occurrences: {
      [k: string]: boolean;
    },
    inspectRoutinePlantId: string,
    informations: Partial<PlantData>,
  ): Promise<PostgrestSingleResponse<null>> {
    return await supabase.rpc('update_plant_from_inspect_routine', {
      plant_id: plantId,
      occurrences,
      inspect_routine_plant_id: inspectRoutinePlantId,
      informations,
    });
  }
}

export const inspectRoutinesPlantsService = new InspectRoutinesPlantsService();
