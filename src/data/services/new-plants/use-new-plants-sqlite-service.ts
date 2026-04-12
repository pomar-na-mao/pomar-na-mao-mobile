import { useSQLiteContext } from 'expo-sqlite';

export interface SqliteNewPlant {
  id: number;
  latitude: number;
  longitude: number;
  gps_timestamp: number;
  created_at: string;
  region: string;
}

export function useNewPlantsSqliteService() {
  const database = useSQLiteContext();

  async function create(plant: Omit<SqliteNewPlant, 'id'>) {
    const statement = await database.prepareAsync(
      'INSERT INTO new_plants (latitude, longitude, gps_timestamp, created_at, region) ' +
        'VALUES ($latitude, $longitude, $gps_timestamp, $created_at, $region)',
    );

    try {
      const result = await statement.executeAsync({
        $latitude: plant.latitude,
        $longitude: plant.longitude,
        $gps_timestamp: plant.gps_timestamp,
        $created_at: plant.created_at,
        $region: plant.region,
      });

      const insertedRowId = result.lastInsertRowId.toLocaleString();

      return { insertedRowId };
    } catch (error) {
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function findById(id: number): Promise<SqliteNewPlant | null> {
    try {
      const query = 'SELECT * FROM new_plants WHERE id = ?';
      const result = await database.getFirstAsync<SqliteNewPlant>(query, [id]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function searchAll(): Promise<SqliteNewPlant[] | null> {
    try {
      const query = 'SELECT * FROM new_plants';
      const response = await database.getAllAsync<SqliteNewPlant>(query);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function remove(id: number) {
    try {
      await database.execAsync(`DELETE FROM new_plants WHERE id = ` + id);
    } catch (error) {
      throw error;
    }
  }

  return {
    create,
    findById,
    searchAll,
    remove,
  };
}
