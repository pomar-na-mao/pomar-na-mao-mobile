import { plantsService } from '@/data/services/plants/plants-service';
import type { InspectRoutineFilter } from '@/domain/models/inspect-routines/inspect-routines-search.schema';
import type { PlantData } from '@/domain/models/shared/plant-data.model';

class PlantsRepository {
  async findAll(filters: InspectRoutineFilter | null) {
    const { data, error } = await plantsService.findAll(filters);

    return { data, error };
  }

  async findById(id: string) {
    const { data, error } = await plantsService.findById(id);

    return { data, error };
  }

  async delete(id: string) {
    const { data, error } = await plantsService.delete(id);

    return { data, error };
  }

  async insert(plant: PlantData) {
    const { data, error } = await plantsService.insert(plant);

    return { data, error };
  }
}

export const plantsRepository = new PlantsRepository();
