import { inspectRoutinesService } from '@/data/services/inspect-routines/inspect-routines-service';
import { plantsService } from '@/data/services/plants/plants-service';
import type { InspectRoutineFilter } from '@/domain/models/inspect-routines/inspect-routines-search.schema';

import type { SupabaseRoutine } from '@/domain/models/inspect-routines/inspect-routines.model';

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
    const { data, error } = await inspectRoutinesService.delete(id);

    return { data, error };
  }

  async insert(routine: SupabaseRoutine) {
    const { data, error } = await inspectRoutinesService.insert(routine);

    return { data, error };
  }
}

export const plantsRepository = new PlantsRepository();
