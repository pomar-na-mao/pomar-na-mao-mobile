import type { SupabaseInspectAnnotation } from '@/domain/models/inspect-annotation/inspect-annotation-supabase';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase-connection';

class InspectAnnotationService {
  async insert(
    annotations: SupabaseInspectAnnotation[],
  ): Promise<PostgrestSingleResponse<SupabaseInspectAnnotation[]>> {
    return await supabase.from('inspect_annotations').insert(annotations).select();
  }

  async findAll() {
    return await supabase.from('inspect_annotations').select('*');
  }
}

export const inspectAnnotationService = new InspectAnnotationService();
