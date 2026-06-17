import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('annotation sync operation identity migration', () => {
  const initialMigration = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/20260617134259_refactor_annotation_sync_operation_identity.sql'),
    'utf8',
  );
  const followUpMigration = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/20260617193938_fix_annotation_operation_history_local_identity.sql'),
    'utf8',
  );

  it('adds a dedicated local operation identity to create_occurrence_annotation', () => {
    expect(initialMigration).toContain('p_field_operation_local_id text default null');
    expect(initialMigration).toContain(
      'v_field_operation_local_id text := coalesce(p_field_operation_local_id, p_local_id);',
    );
  });

  it('reconciles field_operations by operation identity and keeps occurrence events by annotation identity', () => {
    expect(initialMigration).toMatch(/insert into public\.field_operations[\s\S]{0,800}v_field_operation_local_id/);
    expect(initialMigration).toMatch(/insert into public\.plant_occurrences[\s\S]{0,800}p_local_id/);
    expect(initialMigration).toMatch(/insert into public\.plant_occurrence_events[\s\S]{0,1400}p_local_id/);
    expect(initialMigration).toContain('where poe.device_id = p_device_id');
    expect(initialMigration).toContain('and poe.local_change_id = p_local_id');
  });

  it('keeps plant_operation_history idempotent per annotation after the follow-up fix', () => {
    expect(followUpMigration).toContain('create or replace function public.create_occurrence_annotation(');
    expect(followUpMigration).toMatch(/insert into public\.plant_operation_history[\s\S]{0,800}p_local_id/);
    expect(followUpMigration).not.toMatch(
      /insert into public\.plant_operation_history[\s\S]{0,800}v_field_operation_local_id/,
    );
  });
});
