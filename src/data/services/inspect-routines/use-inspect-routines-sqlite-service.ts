import type { SqliteRoutine } from '@/domain/models/inspect-routines/inspect-routines.model';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import { useSQLiteContext } from 'expo-sqlite';

export function useInspectRoutineSqliteService() {
  const database = useSQLiteContext();

  async function findById(id: number): Promise<SqliteRoutine | null> {
    try {
      const query = 'SELECT * FROM inspect_routines WHERE id = ?';

      const result = await database.getFirstAsync<SqliteRoutine>(query, [id]);

      return result;
    } catch (error) {
      throw error;
    }
  }

  async function create(routine: Omit<SqliteRoutine, 'id'>) {
    const statement = await database.prepareAsync(
      'INSERT INTO inspect_routines (date, region, plant_data, is_done) ' +
        'VALUES ($date, $region, $plantData, $isDone)',
    );

    try {
      const result = await statement.executeAsync({
        $date: routine.date,
        $region: routine.region,
        $plantData: JSON.stringify(routine.plant_data),
        $isDone: routine.is_done ? routine.is_done : 0,
      });

      const insertedRowId = result.lastInsertRowId.toLocaleString();

      return { insertedRowId };
    } catch (error) {
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function searchAllRoutines(): Promise<SqliteRoutine[] | null> {
    try {
      const query = 'SELECT * FROM inspect_routines';

      const response = await database.getAllAsync<SqliteRoutine>(query);

      return response;
    } catch (error) {
      throw error;
    }
  }

  async function searchAllPendingRoutines(): Promise<SqliteRoutine[] | null> {
    try {
      const query = 'SELECT * FROM inspect_routines WHERE is_done = 0';

      const response = await database.getAllAsync<SqliteRoutine>(query);

      return response;
    } catch (error) {
      throw error;
    }
  }

  async function searchAllCompletedRoutines(): Promise<SqliteRoutine[] | null> {
    try {
      const query = 'SELECT * FROM inspect_routines WHERE is_done = 1';

      const response = await database.getAllAsync<SqliteRoutine>(query);

      return response;
    } catch (error) {
      throw error;
    }
  }

  async function removeRoutine(id: number) {
    try {
      await database.execAsync(`DELETE FROM inspect_routines WHERE id = ` + id);
    } catch (error) {
      throw error;
    }
  }

  async function updateRoutinePlantData(id: number, plantData: PlantData[]) {
    const statement = await database.prepareAsync(`UPDATE inspect_routines SET plant_data = $plantData WHERE id = $id`);

    try {
      await statement.executeAsync({
        $plantData: JSON.stringify(plantData),
        $id: id,
      });
    } catch (error) {
      throw error;
    }
  }

  /* async function updateRoutineMarkAsIsDone(id: number) {
    const statement = await database.prepareAsync(`UPDATE inspect_routines SET is_done = $isDone WHERE id = $id`);

    try {
      await statement.executeAsync({
        $isDone: '1',
        $id: id,
      });
    } catch (error) {
      throw error;
    }
  } */

  return {
    create,
    searchAllRoutines,
    removeRoutine,
    findById,
    updateRoutinePlantData,
    searchAllPendingRoutines,
    searchAllCompletedRoutines,
  };
}
