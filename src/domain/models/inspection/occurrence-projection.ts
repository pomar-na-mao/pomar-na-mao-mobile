import type {
  InspectionChangeType,
  InspectionPlantOccurrence,
  LocalInspectionChange,
} from '@/domain/models/inspection/inspection.model';

export interface InspectionOccurrenceProjectionChange {
  changeType: InspectionChangeType;
  changedAt?: string | null;
  occurrenceCode: string;
  occurrenceName: string;
  occurrenceTypeId: string;
  severity?: string | null;
}

function isOpenOccurrence(occurrence: InspectionPlantOccurrence) {
  return occurrence.status === 'open';
}

export function projectInspectionPlantOccurrences(
  occurrences: InspectionPlantOccurrence[],
  changes: InspectionOccurrenceProjectionChange[],
): InspectionPlantOccurrence[] {
  return changes.reduce<InspectionPlantOccurrence[]>(
    (currentOccurrences, change) => {
      const occurrenceIndex = currentOccurrences.findIndex(
        (occurrence) => occurrence.occurrenceTypeId === change.occurrenceTypeId && isOpenOccurrence(occurrence),
      );

      if (change.changeType === 'remove_occurrence') {
        return currentOccurrences.filter(
          (occurrence) => occurrence.occurrenceTypeId !== change.occurrenceTypeId || !isOpenOccurrence(occurrence),
        );
      }

      const projectedOccurrence: InspectionPlantOccurrence = {
        code: change.occurrenceCode,
        name: change.occurrenceName,
        observedAt: change.changedAt ?? null,
        occurrenceTypeId: change.occurrenceTypeId,
        severity: change.severity ?? null,
        status: 'open',
      };

      if (occurrenceIndex === -1) {
        return [...currentOccurrences, projectedOccurrence];
      }

      return currentOccurrences.map((occurrence, index) =>
        index === occurrenceIndex ? projectedOccurrence : occurrence,
      );
    },
    occurrences.map((occurrence) => ({ ...occurrence })),
  );
}

export function localInspectionChangeToOccurrenceProjection(
  change: LocalInspectionChange,
): InspectionOccurrenceProjectionChange {
  return {
    changedAt: change.changed_at,
    changeType: change.change_type,
    occurrenceCode: change.occurrence_code,
    occurrenceName: change.occurrence_name,
    occurrenceTypeId: change.occurrence_type_id,
    severity: change.severity ?? null,
  };
}
