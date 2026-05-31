import {
  inspectionSupabaseService,
  type SupabaseInspectionFilterOptions,
} from '@/data/services/inspection/inspection-supabase-service';
import type {
  InspectionFilter,
  InspectionFilterOptions,
  InspectionPlant,
  InspectionPlantOccurrence,
  InspectionPlantRow,
  SyncInspectionPayload,
} from '@/domain/models/inspection';

function groupInspectionPlantRows(rows: InspectionPlantRow[]): InspectionPlant[] {
  const plantsById = new Map<string, InspectionPlant>();

  for (const row of rows) {
    const existingPlant = plantsById.get(row.plant_id);
    const occurrence =
      row.occurrence_type_id && row.occurrence_code && row.occurrence_name
        ? ({
            occurrenceTypeId: row.occurrence_type_id,
            code: row.occurrence_code,
            name: row.occurrence_name,
            status: row.occurrence_status ?? 'open',
            severity: row.occurrence_severity ?? null,
            observedAt: row.occurrence_observed_at ?? null,
          } satisfies InspectionPlantOccurrence)
        : null;

    if (!existingPlant) {
      plantsById.set(row.plant_id, {
        plantId: row.plant_id,
        latitude: row.latitude,
        longitude: row.longitude,
        zoneId: row.zone_id ?? null,
        zoneName: row.zone_name ?? null,
        varietyId: row.variety_id ?? null,
        varietyName: row.variety_name ?? null,
        occurrences: occurrence ? [occurrence] : [],
        isNearest: false,
        isChanged: false,
        distanceMeters: null,
      });
      continue;
    }

    if (!occurrence) {
      continue;
    }

    const alreadyExists = existingPlant.occurrences.some(
      (item) => item.occurrenceTypeId === occurrence.occurrenceTypeId && item.status === occurrence.status,
    );

    if (!alreadyExists) {
      existingPlant.occurrences.push(occurrence);
    }
  }

  return Array.from(plantsById.values());
}

function normalizeFilterOptions(options: SupabaseInspectionFilterOptions): InspectionFilterOptions {
  return {
    zones: options.zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      description: zone.description ?? null,
    })),
    occurrenceTypes: options.occurrenceTypes.map((occurrence) => ({
      id: occurrence.id,
      code: occurrence.code,
      name: occurrence.name,
    })),
    varieties: options.varieties.map((variety) => ({
      id: variety.id,
      name: variety.name,
      description: variety.description ?? null,
    })),
  };
}

class InspectionRepository {
  async getFilterOptions() {
    const { data, error } = await inspectionSupabaseService.getFilterOptions();

    return {
      data: data ? normalizeFilterOptions(data) : null,
      error,
    };
  }

  async getInspectionPlants(filters: InspectionFilter) {
    const { data, error } = await inspectionSupabaseService.getInspectionPlants(filters);

    return {
      data: data ? groupInspectionPlantRows(data) : null,
      error,
    };
  }

  async syncManualInspection(payload: SyncInspectionPayload) {
    const { data, error } = await inspectionSupabaseService.syncManualInspection(payload);

    return {
      data: data?.[0] ?? null,
      error,
    };
  }
}

export const inspectionRepository = new InspectionRepository();
export { groupInspectionPlantRows };
