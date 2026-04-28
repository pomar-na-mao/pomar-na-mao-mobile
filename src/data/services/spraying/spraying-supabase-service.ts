import { supabase } from '../supabase/supabase-connection';

interface AssociatePlantsResult {
  plant_id: string;
  distance_meters: number;
}

class SprayingSupabaseService {
  async getActiveProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .neq('is_active', false)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  }

  async associatePlantsViaRPC(sessionId: string, radiusMeters = 15): Promise<AssociatePlantsResult[]> {
    const { data, error } = await supabase.rpc('associate_plants_to_session', {
      p_session_id: sessionId,
      p_radius_meters: radiusMeters,
    });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as AssociatePlantsResult[];
  }

  async syncSession(session: {
    id: string;
    started_at?: string | null;
    ended_at?: string | null;
    operator_name?: string | null;
    status: string;
    region?: string | null;
    notes?: string | null;
    water_volume_liters?: number | null;
    created_at?: string | null;
  }) {
    const { data, error } = await supabase.from('spraying_sessions').upsert(session).select();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async syncRoutePoints(
    points: {
      id: string;
      session_id: string;
      latitude: number;
      longitude: number;
      gps_timestamp?: number | null;
      accuracy?: number | null;
    }[],
  ) {
    const routePoints = points.map(({ id, session_id, latitude, longitude, gps_timestamp, accuracy }) => ({
      id,
      session_id,
      latitude,
      longitude,
      gps_timestamp,
      accuracy,
    }));

    const { data, error } = await supabase.from('spraying_route_points').upsert(routePoints).select();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async syncProducts(
    products: {
      id: string;
      session_id: string;
      product_id: string;
      dose: number;
      dose_unit: string;
    }[],
  ) {
    const sprayingProducts = products.map(({ id, session_id, product_id, dose, dose_unit }) => ({
      id,
      session_id,
      product_id,
      dose,
      dose_unit,
    }));

    const { data, error } = await supabase.from('spraying_products').upsert(sprayingProducts).select();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

export const sprayingSupabaseService = new SprayingSupabaseService();
