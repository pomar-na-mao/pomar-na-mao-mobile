import fs from 'fs';
import path from 'path';

describe('sync new plant migration', () => {
  const migration = fs.readFileSync(
    path.resolve(process.cwd(), 'supabase/migrations/20260812150714_sync_new_plant_registration.sql'),
    'utf8',
  );
  const databaseTimestampMigration = fs.readFileSync(
    path.resolve(process.cwd(), 'supabase/migrations/20260812231049_use_database_timestamps_for_plant_sync.sql'),
    'utf8',
  );

  it('enforces idempotency and validates structural references', () => {
    expect(migration).toContain('uq_plants_device_local_identity');
    expect(migration).toContain('on conflict (device_id, local_id)');
    expect(migration).toContain('from public.varieties');
    expect(migration).toContain('from public.zones');
    expect(migration).toContain("set search_path = ''");
  });

  it('keeps the definer implementation private and grants only intended roles', () => {
    expect(migration).toContain('function private.sync_new_plant_impl');
    expect(migration).toContain('function public.sync_new_plant');
    expect(migration).toContain('revoke all on function public.sync_new_plant(jsonb) from public');
    expect(migration).toContain('to anon, authenticated, service_role');
  });

  it('generates remote timestamps at synchronization time and preserves created_at on retry', () => {
    expect(databaseTimestampMigration).toContain('created_at = synced_at');
    expect(databaseTimestampMigration).toContain('updated_at = synced_at');
    expect(databaseTimestampMigration).toContain('v_synced_at timestamptz := clock_timestamp()');
    expect(databaseTimestampMigration).toContain("'synced',\n    v_synced_at,\n    v_synced_at,\n    v_synced_at");
    expect(databaseTimestampMigration).toContain('updated_at = excluded.updated_at');
    expect(databaseTimestampMigration).not.toContain('created_at = excluded.created_at');
    expect(databaseTimestampMigration).not.toContain("p_payload->>'createdAt'");
    expect(databaseTimestampMigration).not.toContain("p_payload->>'updatedAt'");
  });
});
