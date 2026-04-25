import type { SupabaseAnnotation } from '@/domain/models/annotation/annotation-supabase';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase-connection';

class AnnotationService {
  async insert(
    annotations: SupabaseAnnotation[],
  ): Promise<PostgrestSingleResponse<SupabaseAnnotation[]>> {
    return await supabase.from('annotations').insert(annotations).select();
  }

  async findAll() {
    return await supabase.from('annotations').select('*');
  }
}

export const annotationService = new AnnotationService();
