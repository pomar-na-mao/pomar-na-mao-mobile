import type { SupabaseInspectAnnotation } from '@/domain/models/inspect-annotation/inspect-annotation-supabase';
import { create } from 'zustand';

interface InspectAnnotationsSyncStore {
  annotations: SupabaseInspectAnnotation[];
  setAnnotations: (annotations: SupabaseInspectAnnotation[]) => void;
}

export const useInspectAnnotationsSyncStore = create<InspectAnnotationsSyncStore>((set) => ({
  annotations: [],
  setAnnotations: (annotations) => set(() => ({ annotations })),
}));
