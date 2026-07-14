import type { InspectionFilter, InspectionPlant, ZoneOption } from '@/domain/models/inspection';
import type { SQLiteDatabase } from 'expo-sqlite';

export interface LoadedFieldWorkZone {
  id: string;
  name: string;
  plantCount: number;
  loadedAt: string;
}

export const LOADED_FIELD_WORK_ZONES_QUERY_KEY = ['field-work-plants', 'loaded-zones'] as const;

interface CachedFieldWorkPlantRow {
  zone_id: string;
  zone_name: string;
  plant_id: string;
  latitude: number;
  longitude: number;
  variety_id?: number | null;
  variety_name?: string | null;
  occurrences_json: string;
}

function rowToPlant(row: CachedFieldWorkPlantRow): InspectionPlant {
  return {
    plantId: row.plant_id,
    latitude: row.latitude,
    longitude: row.longitude,
    zoneId: row.zone_id,
    zoneName: row.zone_name,
    varietyId: row.variety_id ?? null,
    varietyName: row.variety_name ?? null,
    occurrences: JSON.parse(row.occurrences_json || '[]'),
    isNearest: false,
    isChanged: false,
    distanceMeters: null,
  };
}

export function createFieldWorkPlantCacheService(database: SQLiteDatabase) {
  async function clearAllPlants(): Promise<void> {
    await database.runAsync('DELETE FROM local_field_work_zone_plants');
  }

  async function clearZonePlants(zoneId: string): Promise<void> {
    await database.runAsync('DELETE FROM local_field_work_zone_plants WHERE zone_id = ?', [zoneId]);
  }

  async function listLoadedZones(): Promise<LoadedFieldWorkZone[]> {
    return database.getAllAsync<LoadedFieldWorkZone>(
      `SELECT zone_id AS id, zone_name AS name, COUNT(*) AS plantCount, MAX(loaded_at) AS loadedAt
       FROM local_field_work_zone_plants
       GROUP BY zone_id, zone_name
       HAVING COUNT(*) > 0
       ORDER BY zone_name`,
    );
  }

  async function getZonePlants(zoneId: string): Promise<InspectionPlant[]> {
    const rows = await database.getAllAsync<CachedFieldWorkPlantRow>(
      `SELECT zone_id, zone_name, plant_id, latitude, longitude,
              variety_id, variety_name, occurrences_json
       FROM local_field_work_zone_plants
       WHERE zone_id = ?
       ORDER BY plant_id`,
      [zoneId],
    );

    return rows.map(rowToPlant);
  }

  async function getFilteredPlants(filters: InspectionFilter): Promise<InspectionPlant[]> {
    if (!filters.zoneId) return [];

    const plants = await getZonePlants(filters.zoneId);
    if (!filters.occurrenceTypeId) return plants;

    return plants.filter((plant) =>
      plant.occurrences.some(
        (occurrence) => occurrence.occurrenceTypeId === filters.occurrenceTypeId && occurrence.status === 'open',
      ),
    );
  }

  async function replaceZonePlants(zone: ZoneOption, plants: InspectionPlant[]): Promise<void> {
    const loadedAt = new Date().toISOString();

    await database.withTransactionAsync(async () => {
      await database.runAsync('DELETE FROM local_field_work_zone_plants WHERE zone_id = ?', [zone.id]);

      for (const plant of plants) {
        await database.runAsync(
          `INSERT INTO local_field_work_zone_plants (
            zone_id, zone_name, plant_id, latitude, longitude,
            variety_id, variety_name, occurrences_json, loaded_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            zone.id,
            zone.name,
            plant.plantId,
            plant.latitude,
            plant.longitude,
            plant.varietyId ?? null,
            plant.varietyName ?? null,
            JSON.stringify(plant.occurrences),
            loadedAt,
          ],
        );
      }
    });
  }

  return { clearAllPlants, clearZonePlants, getFilteredPlants, getZonePlants, listLoadedZones, replaceZonePlants };
}

export type FieldWorkPlantCacheService = ReturnType<typeof createFieldWorkPlantCacheService>;
