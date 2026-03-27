import { supabase } from './supabase/supabase-connection';
import { occurencesLabels } from '@/shared/constants/values';

class ReportsService {
  async getSummaryKPIs() {
    const { count: totalPlants } = await supabase
      .from('plants')
      .select('*', { count: 'exact', head: true });

    const { count: deadPlants } = await supabase
      .from('plants')
      .select('*', { count: 'exact', head: true })
      .eq('is_dead', true);

    const { count: missingPlants } = await supabase
      .from('inspect_routines_plants')
      .select('*', { count: 'exact', head: true })
      .eq('non_existent', true);

    return {
      totalPlants: totalPlants || 0,
      deadPlants: deadPlants || 0,
      missingPlants: missingPlants || 0,
    };
  }

  async getOccurrenceDistribution() {
    const { data, error } = await supabase
      .from('inspect_annotations')
      .select('occurrences');

    if (error || !data) return [];

    const distribution: Record<string, number> = {};

    data.forEach((row) => {
      if (row.occurrences && typeof row.occurrences === 'object') {
        Object.entries(row.occurrences).forEach(([key, value]) => {
          if (value === true) {
            // Use occurencesLabels or fallback to capitalized key
            const friendlyName = occurencesLabels[key] || (key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '));
            distribution[friendlyName] = (distribution[friendlyName] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(distribution)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Sort desc
  }

  async getPlantsByRegion() {
    const { data, error } = await supabase
      .from('plants')
      .select('region');

    if (error || !data) return [];

    const distribution: Record<string, number> = {};
    data.forEach((row) => {
      const region = row.region || 'Desconhecida';
      distribution[region] = (distribution[region] || 0) + 1;
    });

    return Object.entries(distribution).map(([region, count]) => ({
      region,
      count
    }));
  }

  async getInspectionsByRegion() {
    const { data, error } = await supabase
      .from('inspect_routines')
      .select('region');

    if (error || !data) return [];

    const distribution: Record<string, number> = {};
    data.forEach((row) => {
      const region = row.region || 'Desconhecida';
      distribution[region] = (distribution[region] || 0) + 1;
    });

    return Object.entries(distribution).map(([region, count]) => ({
      region,
      count
    })).sort((a, b) => b.count - a.count);
  }

  async getAlteredPlants() {
    // is_approved = true -> Não Alterada
    // is_approved = false -> Alterada
    const { count: approvedCount } = await supabase
      .from('inspect_routines_plants')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true);

    const { count: alteredCount } = await supabase
      .from('inspect_routines_plants')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false);

    return [
      { status: 'Não Alterada', count: approvedCount || 0 },
      { status: 'Alterada', count: alteredCount || 0 },
    ];
  }
}

export const reportsService = new ReportsService();
