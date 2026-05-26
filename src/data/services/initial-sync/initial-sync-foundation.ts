import type {
  LocalFieldOperationRow,
  LocalInspectionTargetRow,
  LocalOccurrenceTypeRow,
  LocalOperationTypeRow,
  LocalPlantOccurrenceRow,
  LocalPlantRow,
  LocalVarietyRow,
  LocalZoneRow,
  SyncQueueRow,
} from '@/domain/models/structural';

export interface InitialSyncSnapshot {
  varieties: LocalVarietyRow[];
  occurrenceTypes: LocalOccurrenceTypeRow[];
  operationTypes: LocalOperationTypeRow[];
  zones: LocalZoneRow[];
  plants: LocalPlantRow[];
  plantOccurrences: LocalPlantOccurrenceRow[];
  fieldOperations: LocalFieldOperationRow[];
  inspectionTargets: LocalInspectionTargetRow[];
}

export interface InitialSyncRemoteReader {
  loadInitialSnapshot(): Promise<InitialSyncSnapshot>;
}

export interface InitialSyncLocalWriter {
  upsertInitialSnapshot(snapshot: InitialSyncSnapshot): Promise<void>;
  enqueueMutation(record: SyncQueueRow): Promise<void>;
}

export interface InitialSyncFoundation {
  downloadInitialCache(): Promise<void>;
  enqueueMutation(record: SyncQueueRow): Promise<void>;
}

export function createInitialSyncFoundation(
  remoteReader: InitialSyncRemoteReader,
  localWriter: InitialSyncLocalWriter,
): InitialSyncFoundation {
  return {
    async downloadInitialCache() {
      const snapshot = await remoteReader.loadInitialSnapshot();
      await localWriter.upsertInitialSnapshot(snapshot);
    },
    enqueueMutation(record) {
      return localWriter.enqueueMutation(record);
    },
  };
}
