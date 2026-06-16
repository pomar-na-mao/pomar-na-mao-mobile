import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('occurrence event history migration', () => {
  const migration = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/20260615111949_persist_occurrence_event_history.sql'),
    'utf8',
  );
  const cleanupMigrationPath = 'supabase/migrations/20260615122443_remove_duplicate_occurrence_event_indexes.sql';
  const cleanupMigration = readFileSync(resolve(process.cwd(), cleanupMigrationPath), 'utf8');
  const typeIndexMigrationPath = 'supabase/migrations/20260615123851_add_occurrence_event_type_index.sql';
  const typeIndexMigration = readFileSync(resolve(process.cwd(), typeIndexMigrationPath), 'utf8');

  it('reconciles the event table with idempotency and controlled access', () => {
    expect(migration).toContain('create table if not exists public.plant_occurrence_events');
    expect(migration).toContain('chk_plant_occurrence_events_action');
    expect(migration).toContain('uq_plant_occurrence_events_device_local');
    expect(migration).toContain('alter table public.plant_occurrence_events enable row level security');
    expect(migration).toContain('grant select on public.plant_occurrence_events to authenticated');
  });

  it('records inspection actions without replacing creation attribution', () => {
    expect(migration).toContain('function public.sync_manual_inspection');
    expect(migration).toContain("'added'");
    expect(migration).toContain("'updated'");
    expect(migration).toContain("'removed'");
    expect(migration).not.toMatch(
      /update public\.plant_occurrences po\s+set[\s\S]{0,500}field_operation_id = v_field_operation_id/,
    );
  });

  it('records annotation and polygon events with stable retry identities', () => {
    expect(migration).toContain('function public.create_occurrence_annotation');
    expect(migration).toContain('function public.sync_polygon_bulk_update');
    expect(migration).toContain("'polygon'");
    expect(migration).toContain('v_existing_occurrence.id::text');
    expect(migration).toContain('on conflict (device_id, local_change_id)');
  });

  it('extends inspection history without removing the existing occurrences array', () => {
    expect(migration).toContain('function public.get_inspection_operations');
    expect(migration).toContain("'occurrences'");
    expect(migration).toContain("'occurrence_events'");
    expect(migration).toContain("'previous_value'");
    expect(migration).toContain("'new_value'");
    expect(migration).toContain('order by poe.occurred_at, poe.created_at, poe.id');
  });

  it('removes only the duplicate manually-created indexes', () => {
    expect(cleanupMigration).toContain('drop index if exists public.uq_occurrence_event_device_local');
    expect(cleanupMigration).toContain('drop index if exists public.idx_occurrence_events_operation');
    expect(cleanupMigration).toContain('drop index if exists public.idx_occurrence_events_occurrence');
  });

  it('covers the occurrence type foreign key for advisor compliance', () => {
    expect(typeIndexMigration).toContain('idx_plant_occurrence_events_type');
    expect(typeIndexMigration).toContain('(occurrence_type_id)');
  });
});
