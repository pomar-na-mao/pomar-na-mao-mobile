import type { PlantData } from '@/domain/models/shared/plant-data.model';
import { useSQLiteContext } from 'expo-sqlite';

export interface SqliteWorkRoutinePlant {
  id: string;
  plant_data: string;
  updated_at: string;
}

export function useWorkRoutineSqliteService() {
  const database = useSQLiteContext();

  async function upsertPlant(plant: PlantData) {
    const statement = await database.prepareAsync(
      'INSERT OR REPLACE INTO work_routine_plants (id, plant_data, updated_at) ' +
        'VALUES ($id, $plantData, $updatedAt)',
    );

    try {
      await statement.executeAsync({
        $id: plant.id,
        $plantData: JSON.stringify(plant),
        $updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function findById(id: string): Promise<PlantData | null> {
    try {
      const query = 'SELECT * FROM work_routine_plants WHERE id = ?';
      const result = await database.getFirstAsync<SqliteWorkRoutinePlant>(query, [id]);

      if (!result) {
        return null;
      }

      return JSON.parse(result.plant_data) as PlantData;
    } catch (error) {
      throw error;
    }
  }

  async function searchAll(): Promise<PlantData[]> {
    try {
      const query = 'SELECT * FROM work_routine_plants';
      const response = await database.getAllAsync<SqliteWorkRoutinePlant>(query);

      return response.map((item) => JSON.parse(item.plant_data) as PlantData);
    } catch (error) {
      throw error;
    }
  }

  async function clearAll() {
    try {
      await database.execAsync('DELETE FROM work_routine_plants');
    } catch (error) {
      throw error;
    }
  }

  async function replaceAll(plants: PlantData[]) {
    const statement = await database.prepareAsync(
      'INSERT OR REPLACE INTO work_routine_plants (id, plant_data, updated_at) ' +
        'VALUES ($id, $plantData, $updatedAt)',
    );

    try {
      await database.execAsync('BEGIN TRANSACTION');
      await database.execAsync('DELETE FROM work_routine_plants');

      for (const plant of plants) {
        await statement.executeAsync({
          $id: plant.id,
          $plantData: JSON.stringify(plant),
          $updatedAt: plant.updated_at ?? new Date().toISOString(),
        });
      }

      await database.execAsync('COMMIT');
    } catch (error) {
      await database.execAsync('ROLLBACK');
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  return {
    upsertPlant,
    findById,
    searchAll,
    clearAll,
    replaceAll,
  };
}
