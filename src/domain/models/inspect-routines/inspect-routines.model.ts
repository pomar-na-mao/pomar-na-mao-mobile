import type { PlantData } from '../shared/plant-data.model';

export interface SupabaseRoutine {
  id: string;
  date: string;
  region: string;
  is_done: boolean;
  created_at: string;
  description: string;
  updated_at: string;
  is_review_started?: string;
  users: { full_name: string; email: string };
}

export interface SqliteRoutine {
  id: number;
  date: string;
  region: string;
  occurrence: string;
  plant_data: string | PlantData[];
  routine_name: string;
  is_done: number;
  created_at: string;
  updated_at: string;
  description: string;
}

export interface RoutinePlants extends PlantData {
  plant_id: string;
  is_approved: boolean;
  routine_id: number;
}
