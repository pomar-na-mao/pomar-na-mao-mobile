import { inspectAnnotationService } from '@/data/services/inspect-annotation/inspect-annotation-service';
import type { SupabaseInspectAnnotation } from '@/domain/models/inspect-annotation/inspect-annotation-supabase';

class InspectAnnotationRepository {
  async insert(annotations: SupabaseInspectAnnotation[]) {
    const { data, error } = await inspectAnnotationService.insert(annotations);

    return { data, error };
  }

  async findAll() {
    const { data, error } = await inspectAnnotationService.findAll();

    return { data, error };
  }
}

export const inspectAnnotationRepository = new InspectAnnotationRepository();
