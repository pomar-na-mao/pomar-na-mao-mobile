import type { PlantInformation } from '../inspect-routines/inspect-routines-informations.schema';
import type { BooleanKeys } from '../shared/plant-data.model';

export interface SqliteAnnotation {
  id: number;
  latitude: number | null;
  longitude: number | null;
  information: string | PlantInformation;
  occurrences: string | Partial<Record<BooleanKeys, boolean>>;
  created_at: string;
}
