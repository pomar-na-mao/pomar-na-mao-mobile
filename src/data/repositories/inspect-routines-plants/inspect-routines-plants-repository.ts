import { inspectRoutinesPlantsService } from '@/data/services/inspect-routines-plants/inspect-routines-plants-service';
import type { RoutinePlants } from '@/domain/models/inspect-routines/inspect-routines.model';
import type { PlantData } from '@/domain/models/shared/plant-data.model';

class InspectRoutinesPlantsRepository {
  async findAllByRoutineId(routineId: string) {
    const { data, error } = await inspectRoutinesPlantsService.findAllByRoutineId(routineId);

    return { data, error };
  }

  async delete(id: string) {
    const { data, error } = await inspectRoutinesPlantsService.delete(id);

    return { data, error };
  }

  async insert(routinePlants: Partial<RoutinePlants>[]) {
    const { data, error } = await inspectRoutinesPlantsService.insert(routinePlants);

    return { data, error };
  }

  async updatePlantFromInspectRoutine(
    plantId: string,
    occurrences: {
      [k: string]: boolean;
    },
    inspectRoutinePlantId: string,
    informations: Partial<PlantData>,
  ) {
    const { data, error } = await inspectRoutinesPlantsService.updatePlantFromInspectRoutine(
      plantId,
      occurrences,
      inspectRoutinePlantId,
      informations,
    );

    return { data, error };
  }
}

export const inspectRoutinesPlantsRepository = new InspectRoutinesPlantsRepository();
