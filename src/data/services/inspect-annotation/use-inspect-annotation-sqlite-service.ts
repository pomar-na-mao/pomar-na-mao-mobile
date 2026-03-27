import type { SqliteAnnotation } from '@/domain/models/inspect-annotation/inspect-annotation.model';
import { useSQLiteContext } from 'expo-sqlite';

export function useInspectAnnotationSqliteService() {
  const database = useSQLiteContext();

  async function create(annotation: Omit<SqliteAnnotation, 'id'>) {
    const statement = await database.prepareAsync(
      'INSERT INTO inspect_annotations (latitude, longitude, information, occurrences, created_at) ' +
        'VALUES ($latitude, $longitude, $information, $occurrences, $createdAt)',
    );

    try {
      const result = await statement.executeAsync({
        $latitude: annotation.latitude,
        $longitude: annotation.longitude,
        $information: JSON.stringify(annotation.information),
        $occurrences: JSON.stringify(annotation.occurrences),
        $createdAt: annotation.created_at,
      });

      const insertedRowId = result.lastInsertRowId.toLocaleString();

      return { insertedRowId };
    } catch (error) {
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function findById(id: number): Promise<SqliteAnnotation | null> {
    try {
      const query = 'SELECT * FROM inspect_annotations WHERE id = ?';

      const result = await database.getFirstAsync<SqliteAnnotation>(query, [id]);

      return result;
    } catch (error) {
      throw error;
    }
  }

  async function searchAll(): Promise<SqliteAnnotation[] | null> {
    try {
      const query = 'SELECT * FROM inspect_annotations';

      const response = await database.getAllAsync<SqliteAnnotation>(query);

      return response;
    } catch (error) {
      throw error;
    }
  }

  async function remove(id: number) {
    try {
      await database.execAsync(`DELETE FROM inspect_annotations WHERE id = ` + id);
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
