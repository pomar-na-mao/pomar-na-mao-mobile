import { plantsService } from '@/data/services/plants/plants-service';
import type { PlantFilter } from '@/domain/models/shared/plant-filter.model';
import type { PlantData } from '@/domain/models/shared/plant-data.model';

class PlantsRepository {
  async findAll(filters: PlantFilter | null) {
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

  async update(id: string, plant: Partial<PlantData>) {
    const { error } = await plantsService.update(id, plant);

    return { error };
  }
}

export const plantsRepository = new PlantsRepository();
