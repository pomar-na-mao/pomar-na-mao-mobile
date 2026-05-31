import type { InspectionFilterOptions } from '@/domain/models/inspection';
import { inspectionFilterOptions } from '@/test/inspection/fixtures';

describe('inspection model barrel', () => {
  it('re-exports inspection model types through the feature barrel', () => {
    const options: InspectionFilterOptions = inspectionFilterOptions;

    expect(options.zones[0].name).toBe('Talhao 1');
    expect(options.occurrenceTypes[0].code).toBe('PST');
  });
});
