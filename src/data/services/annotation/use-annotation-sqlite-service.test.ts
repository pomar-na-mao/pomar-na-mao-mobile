import { createMockSQLiteDatabase, type MockSQLiteDatabase } from '@/test/inspection/sqlite-mock';
import {
  annotationLocation,
  annotationOccurrenceType,
  localAnnotationOccurrence,
  localAnnotationOperation,
  syncAnnotationResult,
} from '@/test/annotation/fixtures';
import { renderHook } from '@testing-library/react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useAnnotationSqliteService } from './use-annotation-sqlite-service';

jest.mock('expo-sqlite', () => ({
  useSQLiteContext: jest.fn(),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'generated-id'),
}));

const mockedUseSQLiteContext = useSQLiteContext as jest.Mock;

describe('useAnnotationSqliteService', () => {
  let database: MockSQLiteDatabase;

  beforeEach(() => {
    jest.clearAllMocks();
    database = createMockSQLiteDatabase();
    mockedUseSQLiteContext.mockReturnValue(database);
  });

  it('creates an annotation operation and occurrence in one local transaction', async () => {
    database.getFirstAsync.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useAnnotationSqliteService());

    const occurrence = await result.current.createAnnotation({
      deviceId: 'device-1',
      location: annotationLocation,
      notes: 'folhas afetadas',
      occurrence: annotationOccurrenceType,
      severity: 'high',
    });

    const sqlCalls = database.runAsync.mock.calls.map((call) => String(call[0]));
    expect(sqlCalls.some((sql) => sql.includes('INSERT INTO local_field_operations'))).toBe(true);
    expect(sqlCalls.some((sql) => sql.includes('INSERT INTO local_plant_occurrences'))).toBe(true);
    expect(occurrence.plant_id).toBeNull();
    expect(occurrence.sync_status).toBe('pending');
  });

  it('builds sync payloads and updates success or error state', async () => {
    const { result } = renderHook(() => useAnnotationSqliteService());

    const payload = await result.current.buildSyncPayload(localAnnotationOccurrence);
    await result.current.markAnnotationSyncing(localAnnotationOccurrence.id);
    await result.current.markAnnotationSynced(localAnnotationOccurrence, syncAnnotationResult);
    await result.current.markAnnotationSyncError(localAnnotationOccurrence.id, 'rpc failed');

    expect(payload.localAnnotationId).toBe(localAnnotationOccurrence.local_id);
    expect(payload.plantId).toBeNull();
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("SET sync_status = 'syncing'"),
      expect.any(Array),
    );
    expect(database.runAsync).toHaveBeenCalledWith(
      expect.stringContaining("SET sync_status = 'error'"),
      expect.any(Array),
    );
    expect(database.withTransactionAsync).toHaveBeenCalled();
  });

  it('loads local annotations with their operations and derives summary counts', async () => {
    database.getAllAsync
      .mockResolvedValueOnce([localAnnotationOccurrence])
      .mockResolvedValueOnce([localAnnotationOperation])
      .mockResolvedValueOnce([{ sync_status: 'pending' }, { sync_status: 'synced' }, { sync_status: 'error' }]);
    const { result } = renderHook(() => useAnnotationSqliteService());

    await expect(result.current.listAnnotations()).resolves.toEqual([
      { occurrence: localAnnotationOccurrence, operation: localAnnotationOperation },
    ]);
    await expect(result.current.getSummary()).resolves.toEqual({ error: 1, pending: 1, synced: 1, total: 2 });
  });

  it('clears local annotation occurrences and operations', async () => {
    const { result } = renderHook(() => useAnnotationSqliteService());

    await result.current.clearAnnotations();

    expect(database.withTransactionAsync).toHaveBeenCalled();
    expect(database.runAsync).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM local_plant_occurrences'));
    expect(database.runAsync).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM local_field_operations'));
  });
});
