import { workRoutinesService } from '@/data/services/work-routines/work-routines-service';
import type { SupabaseRoutine } from '@/domain/models/inspect-routines/inspect-routines.model';
import type { PlantData } from '@/domain/models/shared/plant-data.model';

class WorkRoutinesRepository {
  async createANewWorkRoutineWithPlants(
    newWorkRoutine: Partial<SupabaseRoutine>,
    enrichedPlantData: Partial<PlantData>[],
  ) {
    const { data, error } = await workRoutinesService.createANewWorkRoutineWithPlants(
      newWorkRoutine,
      enrichedPlantData,
    );

    return { data, error };
  }
}

export const workRoutinesRepository = new WorkRoutinesRepository();
