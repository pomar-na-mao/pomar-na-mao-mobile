import { createSprayingSqliteService } from '@/data/services/spraying/spraying-sqlite-service';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

export function useSprayingSqliteService() {
  const database = useSQLiteContext();

  return useMemo(() => createSprayingSqliteService(database), [database]);
}
