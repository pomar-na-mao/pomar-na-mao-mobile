import type { LocalPlantRegistration } from '@/domain/models/plant-registration';
import { toSyncNewPlantPayload } from '@/domain/models/plant-registration';
import {
  plantRegistrationSupabaseService,
  type PlantRegistrationSupabaseServiceContract,
} from '@/data/services/plant-registration/plant-registration-supabase-service';
import {
  createPlantRegistrationSqliteService,
  type PlantRegistrationSqliteService,
} from '@/data/services/plant-registration/plant-registration-sqlite-service';
import type { SQLiteDatabase } from 'expo-sqlite';

const inFlightSyncs = new Map<string, Promise<void>>();

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    if (error.message.trim().toLowerCase() === 'network request failed') {
      return 'Sem conexão com a internet. Verifique sua conexão e tente novamente.';
    }
    return error.message;
  }
  return 'Não foi possível sincronizar a planta.';
}

export function createPlantRegistrationRepository(
  database: SQLiteDatabase,
  dependencies?: {
    local?: PlantRegistrationSqliteService;
    remote?: PlantRegistrationSupabaseServiceContract;
  },
) {
  const local = dependencies?.local ?? createPlantRegistrationSqliteService(database);
  const remote = dependencies?.remote ?? plantRegistrationSupabaseService;

  async function syncInternal(registration: LocalPlantRegistration): Promise<void> {
    const started = await local.markSyncing(registration.id);
    if (!started) return;

    try {
      const response = await remote.sync(toSyncNewPlantPayload(registration));
      if (response.error) throw response.error;
      if (!response.data) throw new Error('Resposta de sincronização incompleta.');
      await local.markSynced(registration.id, response.data);
    } catch (error) {
      await local.markSyncError(registration.id, getErrorMessage(error));
      throw error;
    }
  }

  async function sync(id: string): Promise<void> {
    const existing = inFlightSyncs.get(id);
    if (existing) return existing;

    const request = (async () => {
      const registration = await local.findById(id);
      if (!registration || registration.sync_status === 'synced') return;
      await syncInternal(registration);
    })().finally(() => inFlightSyncs.delete(id));
    inFlightSyncs.set(id, request);
    return request;
  }

  return {
    create: local.create,
    deleteAllLocal: local.deleteAllLocal,
    deleteLocal: local.deleteLocal,
    list: local.list,
    recoverInterruptedSyncs: local.recoverInterruptedSyncs,
    sync,
  };
}

export type PlantRegistrationRepository = ReturnType<typeof createPlantRegistrationRepository>;
