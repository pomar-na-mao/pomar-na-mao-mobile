import type {
  InspectionFilter,
  InspectionPlant,
  LocalInspection,
  SyncInspectionPayload,
} from '@/domain/models/inspection/inspection.model';
import { inspectionFilter, inspectionPlant, localInspection, syncInspectionPayload } from '@/test/inspection/fixtures';

describe('inspection domain models', () => {
  it('accepts the inspection runtime fixtures as domain contracts', () => {
    const filter: InspectionFilter = inspectionFilter;
    const plant: InspectionPlant = inspectionPlant;
    const inspection: LocalInspection = localInspection;
    const payload: SyncInspectionPayload = syncInspectionPayload;

    expect(filter.zoneId).toBe('zone-1');
    expect(plant.plantId).toBe('plant-1');
    expect(inspection.id).toBe('inspection-1');
    expect(payload.plantsChanged).toHaveLength(1);
  });
});
