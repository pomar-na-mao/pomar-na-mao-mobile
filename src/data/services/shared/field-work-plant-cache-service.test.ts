import { inspectionFilter, inspectionPlant, secondInspectionPlant } from '@/test/inspection/fixtures';
import type { SQLiteDatabase } from 'expo-sqlite';
import { createFieldWorkPlantCacheService } from './field-work-plant-cache-service';

function createDatabase() {
  return {
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
    withTransactionAsync: jest.fn(async (callback: () => Promise<void>) => callback()),
  };
}

describe('field-work plant cache service', () => {
  it('deletes every cached plant with one statement', async () => {
    const database = createDatabase();
    const service = createFieldWorkPlantCacheService(database as unknown as SQLiteDatabase);

    await service.clearAllPlants();

    expect(database.runAsync).toHaveBeenCalledWith('DELETE FROM local_field_work_zone_plants');
  });

  it('deletes only plants from the selected zone', async () => {
    const database = createDatabase();
    const service = createFieldWorkPlantCacheService(database as unknown as SQLiteDatabase);

    await service.clearZonePlants('zone-2');

    expect(database.runAsync).toHaveBeenCalledWith('DELETE FROM local_field_work_zone_plants WHERE zone_id = ?', [
      'zone-2',
    ]);
  });

  it('atomically replaces a zone snapshot with complete plant data', async () => {
    const database = createDatabase();
    const service = createFieldWorkPlantCacheService(database as unknown as SQLiteDatabase);

    await service.replaceZonePlants({ id: 'zone-1', name: 'Talhao 1' }, [inspectionPlant]);

    expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(database.runAsync).toHaveBeenNthCalledWith(1, 'DELETE FROM local_field_work_zone_plants WHERE zone_id = ?', [
      'zone-1',
    ]);
    expect(database.runAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO local_field_work_zone_plants'),
      expect.arrayContaining(['zone-1', 'Talhao 1', 'plant-1', JSON.stringify(inspectionPlant.occurrences)]),
    );
  });

  it('maps cached rows and filters open occurrences locally', async () => {
    const database = createDatabase();
    database.getAllAsync.mockResolvedValue([
      {
        zone_id: 'zone-1',
        zone_name: 'Talhao 1',
        plant_id: inspectionPlant.plantId,
        latitude: inspectionPlant.latitude,
        longitude: inspectionPlant.longitude,
        variety_id: inspectionPlant.varietyId,
        variety_name: inspectionPlant.varietyName,
        occurrences_json: JSON.stringify(inspectionPlant.occurrences),
      },
      {
        zone_id: 'zone-1',
        zone_name: 'Talhao 1',
        plant_id: secondInspectionPlant.plantId,
        latitude: secondInspectionPlant.latitude,
        longitude: secondInspectionPlant.longitude,
        variety_id: secondInspectionPlant.varietyId,
        variety_name: secondInspectionPlant.varietyName,
        occurrences_json: '[]',
      },
    ]);
    const service = createFieldWorkPlantCacheService(database as unknown as SQLiteDatabase);

    await expect(service.getFilteredPlants(inspectionFilter)).resolves.toEqual([inspectionPlant]);
  });

  it('lists only non-empty loaded zones', async () => {
    const database = createDatabase();
    const zones = [{ id: 'zone-1', name: 'Talhao 1', plantCount: 2, loadedAt: '2026-07-01' }];
    database.getAllAsync.mockResolvedValue(zones);
    const service = createFieldWorkPlantCacheService(database as unknown as SQLiteDatabase);

    await expect(service.listLoadedZones()).resolves.toEqual(zones);
    expect(database.getAllAsync).toHaveBeenCalledWith(expect.stringContaining('HAVING COUNT(*) > 0'));
  });
});
