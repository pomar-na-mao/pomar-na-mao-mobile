import fs from 'fs';
import path from 'path';

describe('plant registration local schema', () => {
  const source = fs.readFileSync(
    path.resolve(process.cwd(), 'src/data/services/sqlite/initialize-sqlite-database.ts'),
    'utf8',
  );

  it('uses additive migration-safe columns and keeps local plants intact', () => {
    expect(source).toContain("ensureColumn(database, 'local_plants', 'remote_plant_id', 'TEXT')");
    expect(source).toContain("ensureColumn(database, 'local_plants', 'synced_at', 'TEXT')");
    expect(source).toContain("ensureColumn(database, 'local_plants', 'record_origin'");
    expect(source).not.toContain('DROP TABLE local_plants');
  });

  it('indexes registration origin and sync state', () => {
    expect(source).toContain('idx_local_plants_registration_origin');
    expect(source).toContain('idx_local_plants_registration_sync');
  });
});
