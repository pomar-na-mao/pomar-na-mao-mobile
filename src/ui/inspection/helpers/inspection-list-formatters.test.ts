import { formatInspectionDateTime } from './inspection-list-formatters';

describe('formatInspectionDateTime', () => {
  it('returns a fallback label when date is missing', () => {
    expect(formatInspectionDateTime()).toBe('Sem data');
    expect(formatInspectionDateTime(null)).toBe('Sem data');
  });

  it('formats date and time using Brazilian locale ordering', () => {
    expect(formatInspectionDateTime('2026-05-30T15:45:00.000Z')).toMatch(/30\/05\/26/);
  });
});
