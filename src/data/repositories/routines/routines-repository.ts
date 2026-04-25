import { routinesService } from '@/data/services/routines/routines-service';
import type { SupabaseRoutine } from '@/domain/models/inspect-routines/inspect-routines.model';
import type { PlantData } from '@/domain/models/shared/plant-data.model';

class RoutinesRepository {
  async createANewRoutineWithPlants(
    newRoutine: Partial<SupabaseRoutine>,
    enrichedPlantData: Partial<PlantData>[],
  ) {
    const { data, error } = await routinesService.createANewRoutineWithPlants(
      newRoutine,
      enrichedPlantData,
    );

    return { data, error };
  }
}

export const routinesRepository = new RoutinesRepository();
