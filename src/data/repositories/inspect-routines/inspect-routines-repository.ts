import { inspectRoutinesService } from '@/data/services/inspect-routines/inspect-routines-service';

import type { InspectRoutinesSyncFilter } from '@/domain/models/inspect-routines/inspect-routines-sync.schema';
import type { SupabaseRoutine } from '@/domain/models/inspect-routines/inspect-routines.model';

class InspectRoutinesRepository {
  async findAll(filters: InspectRoutinesSyncFilter | null) {
    const { data, error } = await inspectRoutinesService.findAll(filters);

    return { data, error };
  }

  async delete(id: string) {
    const { data, error } = await inspectRoutinesService.delete(id);

    return { data, error };
  }

  async insert(routine: Partial<SupabaseRoutine>) {
    const { data, error } = await inspectRoutinesService.insert(routine);

    return { data, error };
  }
}

export const inspectRoutinesRepository = new InspectRoutinesRepository();
