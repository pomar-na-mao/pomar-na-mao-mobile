import { inspectsService } from '@/data/services/inspects/inspects-service';
import type { SupabaseRoutine } from '@/domain/models/inspect-routines/inspect-routines.model';
import type { PlantData } from '@/domain/models/shared/plant-data.model';

class InspectsRepository {
  async createANewInspectRoutineWithPlants(
    newInspectRoutine: Partial<SupabaseRoutine>,
    enrichedPlantData: Partial<PlantData>[],
  ) {
    const { data, error } = await inspectsService.createANewInspectRoutineWithPlants(
      newInspectRoutine,
      enrichedPlantData,
    );

    return { data, error };
  }

  async getNearestPlant(lat: number, lon: number) {
    const { data, error } = await inspectsService.getNearestPlant(lat, lon);

    return { data, error };
  }

  async updatePlant(id: string, data: Partial<PlantData>) {
    const { error } = await inspectsService.updatePlant(id, data);

    return { error };
  }

  async approveInspectAnnotation(id: string) {
    const { data, error } = await inspectsService.approveInspectAnnotation(id);

    return { data, error };
  }
}

export const inspectsRepository = new InspectsRepository();
