import { annotationService } from '@/data/services/annotation/annotation-service';
import type { SupabaseAnnotation } from '@/domain/models/annotation/annotation-supabase';

class AnnotationRepository {
  async insert(annotations: SupabaseAnnotation[]) {
    const { data, error } = await annotationService.insert(annotations);

    return { data, error };
  }

  async findAll() {
    const { data, error } = await annotationService.findAll();

    return { data, error };
  }
}

export const annotationRepository = new AnnotationRepository();
