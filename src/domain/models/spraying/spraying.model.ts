export interface Product {
  id: string;
  name: string;
  active_ingredient?: string | null;
  category?: string | null;
  concentration?: number | null;
  unit: string;
  manufacturer?: string | null;
  notes?: string | null;
  is_active: number;
  created_at?: string | null;
  synced_at?: string | null;
  dirty: number;
  deleted: number;
}

export interface SprayingSession {
  id: string;
  started_at?: string | null;
  ended_at?: string | null;
  operator_name?: string | null;
  status: 'in_progress' | 'completed' | 'cancelled';
  region?: string | null;
  notes?: string | null;
  water_volume_liters?: number | null;
  created_at?: string | null;
  synced_at?: string | null;
  dirty: number;
  deleted: number;
}

export interface SprayingProduct {
  id: string;
  session_id: string;
  product_id: string;
  dose: number;
  dose_unit: string;
  synced_at?: string | null;
  dirty: number;
  deleted: number;
}

export interface SprayingRoutePoint {
  id: string;
  session_id: string;
  latitude: number;
  longitude: number;
  gps_timestamp?: number | null;
  accuracy?: number | null;
  synced_at?: string | null;
}

export interface SprayingPlant {
  id: string;
  session_id: string;
  plant_id: string;
  distance_meters?: number | null;
  association_method: string;
  synced_at?: string | null;
  dirty: number;
  deleted: number;
}
