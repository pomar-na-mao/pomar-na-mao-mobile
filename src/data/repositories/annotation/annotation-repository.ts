import {
  annotationSupabaseService,
  normalizeAnnotationSyncResult,
} from '@/data/services/annotation/annotation-supabase-service';
import type { SyncAnnotationPayload } from '@/domain/models/annotation';

class AnnotationRepository {
  async getOptions() {
    return await annotationSupabaseService.getOptions();
  }

  async syncAnnotation(payload: SyncAnnotationPayload) {
    const { data, error } = await annotationSupabaseService.syncAnnotation(payload);

    return {
      data: normalizeAnnotationSyncResult(data),
      error,
    };
  }
}

export const annotationRepository = new AnnotationRepository();
