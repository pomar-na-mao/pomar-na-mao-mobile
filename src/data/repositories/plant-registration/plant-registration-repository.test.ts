import type { LocalPlantRegistration } from '@/domain/models/plant-registration';
import type { SQLiteDatabase } from 'expo-sqlite';
import { createPlantRegistrationRepository } from './plant-registration-repository';

const registration: LocalPlantRegistration = {
  id: 'local-1',
  local_id: 'local-1',
  latitude: -23.5,
  longitude: -46.6,
  variety_id: 7,
  zone_id: 'zone-1',
  planting_date: '2026-08-01T00:00:00.000Z',
  is_dead: 0,
  is_new: 1,
  non_existent: 0,
  created_at: 'created',
  updated_at: 'updated',
  sync_status: 'pending_create',
  device_id: 'device-1',
  record_origin: 'local_registration',
};

function setup(remoteResult: unknown) {
  const local = {
    create: jest.fn(),
    deleteAllLocal: jest.fn(),
    deleteLocal: jest.fn(),
    list: jest.fn(),
    recoverInterruptedSyncs: jest.fn(),
    findById: jest.fn(async () => registration),
    markSyncing: jest.fn(async () => true),
    markSynced: jest.fn(),
    markSyncError: jest.fn(),
  };
  const remote = { sync: jest.fn(async () => remoteResult) };
  const repository = createPlantRegistrationRepository({} as SQLiteDatabase, {
    local: local as never,
    remote: remote as never,
  });
  return { local, remote, repository };
}

describe('plant registration repository', () => {
  it('marks the local row synced only after a complete remote result', async () => {
    const result = { plant_id: 'remote-1', created_at: 'created', updated_at: 'updated', synced_at: 'synced' };
    const { local, repository } = setup({ data: result, error: null });

    await repository.sync('local-1');

    expect(local.markSyncing).toHaveBeenCalledWith('local-1');
    expect(local.markSynced).toHaveBeenCalledWith('local-1', result);
    expect(local.markSyncError).not.toHaveBeenCalled();
  });

  it('preserves a retryable error for failed or incomplete responses', async () => {
    const { local, repository } = setup({ data: null, error: null });

    await expect(repository.sync('local-1')).rejects.toThrow('Resposta de sincronização incompleta.');
    expect(local.markSynced).not.toHaveBeenCalled();
    expect(local.markSyncError).toHaveBeenCalledWith('local-1', 'Resposta de sincronização incompleta.');
  });

  it('translates only the offline network error before persisting it', async () => {
    const { local, repository } = setup({ data: null, error: new TypeError('Network request failed') });

    await expect(repository.sync('local-1')).rejects.toThrow('Network request failed');
    expect(local.markSyncError).toHaveBeenCalledWith(
      'local-1',
      'Sem conexão com a internet. Verifique sua conexão e tente novamente.',
    );
  });

  it('keeps other Supabase error messages unchanged', async () => {
    const { local, repository } = setup({ data: null, error: new Error('Invalid API key') });

    await expect(repository.sync('local-1')).rejects.toThrow('Invalid API key');
    expect(local.markSyncError).toHaveBeenCalledWith('local-1', 'Invalid API key');
  });

  it('coalesces concurrent sync attempts for one local id', async () => {
    let resolveRemote!: (value: unknown) => void;
    const remotePromise = new Promise((resolve) => {
      resolveRemote = resolve;
    });
    const { remote, repository } = setup(remotePromise);

    const first = repository.sync('local-1');
    const second = repository.sync('local-1');
    await Promise.resolve();
    resolveRemote({ data: { plant_id: 'remote-1', created_at: 'c', updated_at: 'u', synced_at: 's' }, error: null });
    await Promise.all([first, second]);

    expect(remote.sync).toHaveBeenCalledTimes(1);
  });
});
