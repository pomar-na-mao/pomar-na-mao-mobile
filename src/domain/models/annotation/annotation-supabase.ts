import type { BooleanKeys } from '../shared/plant-data.model';

export interface SupabaseAnnotation {
  id?: string;
  latitude: number;
  longitude: number;
  variety: string | null;
  mass: string | null;
  life_of_the_tree: string | null;
  harvest: string | null;
  planting_date: string | null;
  description: string | null;
  occurrences: Partial<Record<BooleanKeys, boolean>>;
  is_approved?: boolean;
  created_at: string;
}
