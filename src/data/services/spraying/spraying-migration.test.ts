import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('reviewed spraying migration', () => {
  const migration = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/20260607104346_sync_reviewed_spraying_operation.sql'),
    'utf8',
  );
  const ambiguityFix = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/20260607131648_fix_sync_reviewed_spraying_operation_ambiguity.sql'),
    'utf8',
  );

  it('uses one secured transactional function and stable identities', () => {
    expect(migration).toContain('function public.sync_reviewed_spraying_operation');
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain('revoke all on function public.sync_reviewed_spraying_operation');
    expect(migration).toContain('uq_field_operations_device_local');
    expect(migration).toContain('on conflict (device_id, local_id)');
  });

  it('persists exactly the reviewed child aggregate', () => {
    expect(migration).toContain("p_payload->'confirmedPlants'");
    expect(migration).toContain('delete from public.plant_operation_history');
    expect(migration).toContain('insert into public.field_operation_track_points');
    expect(migration).toContain('insert into public.field_operation_routes');
    expect(migration).toContain('insert into public.operation_inputs');
    expect(migration).toContain('insert into public.plant_operation_history');
  });

  it('persists the PL/pgSQL output-column ambiguity fix', () => {
    expect(ambiguityFix).toContain('#variable_conflict use_column');
    expect(ambiguityFix).toContain('pg_get_functiondef');
  });
});
