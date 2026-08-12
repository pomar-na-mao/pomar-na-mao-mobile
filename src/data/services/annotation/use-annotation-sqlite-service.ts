import type {
  AnnotationOccurrenceTypeOption,
  AnnotationRecord,
  AnnotationSummary,
  AnnotationZoneOption,
  CreateAnnotationParams,
  LocalAnnotationOccurrence,
  LocalAnnotationOperation,
  SyncAnnotationPayload,
  SyncAnnotationResult,
} from '@/domain/models/annotation';
import { randomUUID } from 'expo-crypto';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

function nowIso() {
  return new Date().toISOString();
}

function createEmptySummary(): AnnotationSummary {
  return { error: 0, pending: 0, synced: 0, total: 0 };
}

function summarizeOccurrences(occurrences: LocalAnnotationOccurrence[]): AnnotationSummary {
  return occurrences.reduce((summary, occurrence) => {
    if (occurrence.sync_status === 'synced') {
      summary.synced += 1;
      return summary;
    }

    summary.total += 1;

    if (occurrence.sync_status === 'error') {
      summary.error += 1;
    } else {
      summary.pending += 1;
    }

    return summary;
  }, createEmptySummary());
}

export function useAnnotationSqliteService() {
  const database = useSQLiteContext();

  async function getCachedOptions(): Promise<{
    occurrenceTypes: AnnotationOccurrenceTypeOption[];
    zones: AnnotationZoneOption[];
  }> {
    const [occurrenceTypes, zones] = await Promise.all([
      database.getAllAsync<AnnotationOccurrenceTypeOption>(
        'SELECT id, code, name FROM local_occurrence_types ORDER BY name',
      ),
      database.getAllAsync<AnnotationZoneOption>('SELECT id, name, description FROM local_zones ORDER BY name'),
    ]);

    return { occurrenceTypes, zones };
  }

  async function getActiveOperation(): Promise<LocalAnnotationOperation | null> {
    return await database.getFirstAsync<LocalAnnotationOperation>(
      `SELECT * FROM local_field_operations
       WHERE operation_type_code = 'occurrence_annotation'
         AND finished_at IS NULL
         AND sync_status != 'synced'
       ORDER BY started_at DESC
       LIMIT 1`,
    );
  }

  async function createOperation(deviceId: string): Promise<LocalAnnotationOperation> {
    const timestamp = nowIso();
    const id = randomUUID();
    const operation: LocalAnnotationOperation = {
      created_at: timestamp,
      device_id: deviceId,
      finished_at: null,
      id,
      local_id: id,
      notes: null,
      operation_type_code: 'occurrence_annotation',
      operation_type_id: null,
      remote_field_operation_id: null,
      source: 'manual',
      started_at: timestamp,
      sync_error: null,
      sync_status: 'pending',
      synced_at: null,
      title: 'Anotação de ocorrência',
      updated_at: timestamp,
      zone_id: null,
    };

    await database.runAsync(
      `INSERT INTO local_field_operations (
        id, local_id, operation_type_id, operation_type_code, zone_id, title, source,
        started_at, finished_at, notes, created_at, updated_at, sync_status, device_id,
        remote_field_operation_id, synced_at, sync_error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        operation.id,
        operation.local_id ?? null,
        operation.operation_type_id ?? null,
        operation.operation_type_code ?? null,
        operation.zone_id ?? null,
        operation.title ?? null,
        operation.source,
        operation.started_at,
        operation.finished_at ?? null,
        operation.notes ?? null,
        operation.created_at ?? null,
        operation.updated_at ?? null,
        operation.sync_status,
        operation.device_id ?? null,
        operation.remote_field_operation_id ?? null,
        operation.synced_at ?? null,
        operation.sync_error ?? null,
      ],
    );

    return operation;
  }

  async function getOrCreateActiveOperation(deviceId: string): Promise<LocalAnnotationOperation> {
    return (await getActiveOperation()) ?? (await createOperation(deviceId));
  }

  async function createAnnotation(params: CreateAnnotationParams): Promise<LocalAnnotationOccurrence> {
    const timestamp = nowIso();
    const operation = await getOrCreateActiveOperation(params.deviceId);
    const id = randomUUID();
    const occurrence: LocalAnnotationOccurrence = {
      annotation_latitude: params.location.coords.latitude,
      annotation_longitude: params.location.coords.longitude,
      assigned_distance_meters: null,
      assignment_method: null,
      assignment_status: 'pending_review',
      created_at: timestamp,
      device_id: params.deviceId,
      field_operation_id: operation.id,
      gps_accuracy_m: params.location.coords.accuracy ?? null,
      id,
      local_id: id,
      notes: params.notes ?? null,
      observed_at: timestamp,
      occurrence_code: params.occurrence.code,
      occurrence_name: params.occurrence.name,
      occurrence_type_id: params.occurrence.id,
      plant_id: null,
      remote_occurrence_id: null,
      severity: params.severity ?? null,
      status: 'open',
      sync_error: null,
      sync_status: 'pending',
      synced_at: null,
      updated_at: timestamp,
    };

    await database.withTransactionAsync(async () => {
      await database.runAsync(
        `INSERT INTO local_plant_occurrences (
          id, local_id, plant_id, occurrence_type_id, occurrence_code, occurrence_name,
          field_operation_id, observed_at, severity, status, notes, annotation_latitude,
          annotation_longitude, gps_accuracy_m, assigned_distance_meters, assignment_method,
          assignment_status, created_at, updated_at, sync_status, device_id,
          remote_occurrence_id, synced_at, sync_error
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          occurrence.id,
          occurrence.local_id ?? null,
          occurrence.plant_id ?? null,
          occurrence.occurrence_type_id,
          occurrence.occurrence_code ?? null,
          occurrence.occurrence_name ?? null,
          occurrence.field_operation_id ?? null,
          occurrence.observed_at,
          occurrence.severity ?? null,
          occurrence.status,
          occurrence.notes ?? null,
          occurrence.annotation_latitude,
          occurrence.annotation_longitude,
          occurrence.gps_accuracy_m ?? null,
          occurrence.assigned_distance_meters ?? null,
          occurrence.assignment_method ?? null,
          occurrence.assignment_status ?? null,
          occurrence.created_at ?? null,
          occurrence.updated_at ?? null,
          occurrence.sync_status,
          occurrence.device_id ?? null,
          occurrence.remote_occurrence_id ?? null,
          occurrence.synced_at ?? null,
          occurrence.sync_error ?? null,
        ],
      );
      await database.runAsync(
        `UPDATE local_field_operations
         SET sync_status = 'pending', updated_at = ?
         WHERE id = ?`,
        [timestamp, operation.id],
      );
    });

    return occurrence;
  }

  async function listAnnotations(): Promise<AnnotationRecord[]> {
    const occurrences = await database.getAllAsync<LocalAnnotationOccurrence>(
      `SELECT * FROM local_plant_occurrences
       WHERE field_operation_id IN (
         SELECT id FROM local_field_operations WHERE operation_type_code = 'occurrence_annotation'
       )
       ORDER BY observed_at DESC`,
    );

    if (occurrences.length === 0) {
      return [];
    }

    const operationIds = Array.from(
      new Set(
        occurrences
          .map((occurrence) => occurrence.field_operation_id)
          .filter((operationId): operationId is string => typeof operationId === 'string' && operationId.length > 0),
      ),
    );
    const operations = operationIds.length
      ? await database.getAllAsync<LocalAnnotationOperation>(
          `SELECT * FROM local_field_operations
           WHERE id IN (${operationIds.map(() => '?').join(',')})`,
          operationIds,
        )
      : [];
    const operationsById = new Map(operations.map((operation) => [operation.id, operation]));

    return occurrences.map((occurrence) => ({
      occurrence,
      operation: occurrence.field_operation_id ? (operationsById.get(occurrence.field_operation_id) ?? null) : null,
    }));
  }

  async function getSummary(): Promise<AnnotationSummary> {
    const rows = await database.getAllAsync<LocalAnnotationOccurrence>(
      `SELECT sync_status FROM local_plant_occurrences
       WHERE field_operation_id IN (
         SELECT id FROM local_field_operations WHERE operation_type_code = 'occurrence_annotation'
       )`,
    );

    return summarizeOccurrences(rows);
  }

  async function finishActiveOperation(operationId: string) {
    await database.runAsync(
      `UPDATE local_field_operations
       SET finished_at = COALESCE(finished_at, ?), sync_status = 'pending', updated_at = ?
       WHERE id = ?`,
      [nowIso(), nowIso(), operationId],
    );
  }

  async function getPendingAnnotations(): Promise<LocalAnnotationOccurrence[]> {
    return await database.getAllAsync<LocalAnnotationOccurrence>(
      `SELECT * FROM local_plant_occurrences
       WHERE sync_status IN ('pending', 'error')
         AND field_operation_id IN (
           SELECT id FROM local_field_operations WHERE operation_type_code = 'occurrence_annotation'
         )
       ORDER BY observed_at`,
    );
  }

  async function buildSyncPayload(occurrence: LocalAnnotationOccurrence): Promise<SyncAnnotationPayload> {
    if (!occurrence.field_operation_id) {
      throw new Error('Anotação local sem operacao vinculada nao pode ser sincronizada.');
    }

    return {
      assignedDistanceMeters: occurrence.assigned_distance_meters ?? null,
      assignmentMethod: occurrence.assignment_method ?? null,
      assignmentStatus: occurrence.assignment_status ?? null,
      deviceId: occurrence.device_id ?? null,
      gpsAccuracyM: occurrence.gps_accuracy_m ?? null,
      latitude: occurrence.annotation_latitude,
      localAnnotationId: occurrence.local_id ?? occurrence.id,
      localOperationId: occurrence.field_operation_id,
      longitude: occurrence.annotation_longitude,
      notes: occurrence.notes ?? null,
      observedAt: occurrence.observed_at,
      occurrenceTypeId: occurrence.occurrence_type_id,
      plantId: occurrence.plant_id ?? null,
      severity: occurrence.severity ?? null,
    };
  }

  async function markAnnotationSyncing(occurrenceId: string) {
    await database.runAsync(
      `UPDATE local_plant_occurrences
       SET sync_status = 'syncing', sync_error = NULL, updated_at = ?
       WHERE id = ?`,
      [nowIso(), occurrenceId],
    );
  }

  async function markAnnotationSynced(occurrence: LocalAnnotationOccurrence, result: SyncAnnotationResult) {
    const timestamp = nowIso();
    const usesLegacyOperationIdentity = result.operation_identity_mode === 'legacy';

    await database.withTransactionAsync(async () => {
      if (occurrence.field_operation_id && !usesLegacyOperationIdentity) {
        const operation = await database.getFirstAsync<Pick<LocalAnnotationOperation, 'remote_field_operation_id'>>(
          `SELECT remote_field_operation_id
           FROM local_field_operations
           WHERE id = ?`,
          [occurrence.field_operation_id],
        );

        if (operation?.remote_field_operation_id && operation.remote_field_operation_id !== result.field_operation_id) {
          throw new Error('Operação remota divergente para a mesma operação local de anotação.');
        }
      }

      await database.runAsync(
        `UPDATE local_plant_occurrences
         SET sync_status = 'synced', remote_occurrence_id = ?, synced_at = ?,
             sync_error = NULL, updated_at = ?
         WHERE id = ?`,
        [result.occurrence_id ?? occurrence.remote_occurrence_id ?? null, timestamp, timestamp, occurrence.id],
      );

      if (occurrence.field_operation_id) {
        if (!usesLegacyOperationIdentity) {
          await database.runAsync(
            `UPDATE local_field_operations
             SET remote_field_operation_id = COALESCE(remote_field_operation_id, ?),
                 sync_error = NULL, updated_at = ?
             WHERE id = ?`,
            [result.field_operation_id, timestamp, occurrence.field_operation_id],
          );
        }

        await database.runAsync(
          `UPDATE local_field_operations
           SET sync_status = 'synced', synced_at = ?, sync_error = NULL, updated_at = ?
           WHERE id = ?
             AND NOT EXISTS (
               SELECT 1 FROM local_plant_occurrences
               WHERE field_operation_id = ? AND sync_status != 'synced'
             )`,
          [timestamp, timestamp, occurrence.field_operation_id, occurrence.field_operation_id],
        );
      }
    });
  }

  async function markAnnotationSyncError(occurrenceId: string, message: string, operationId?: string | null) {
    const timestamp = nowIso();

    await database.withTransactionAsync(async () => {
      await database.runAsync(
        `UPDATE local_plant_occurrences
         SET sync_status = 'error', sync_error = ?, updated_at = ?
         WHERE id = ?`,
        [message, timestamp, occurrenceId],
      );

      if (operationId) {
        await database.runAsync(
          `UPDATE local_field_operations
           SET sync_status = 'error', sync_error = ?, updated_at = ?
           WHERE id = ?`,
          [message, timestamp, operationId],
        );
      }
    });
  }

  async function clearAnnotations() {
    await database.withTransactionAsync(async () => {
      await database.runAsync(
        `DELETE FROM local_plant_occurrences
         WHERE field_operation_id IN (
           SELECT id FROM local_field_operations WHERE operation_type_code = 'occurrence_annotation'
         )`,
      );
      await database.runAsync(
        `DELETE FROM local_field_operations
         WHERE operation_type_code = 'occurrence_annotation'`,
      );
    });
  }

  return useMemo(
    () => ({
      getCachedOptions,
      getActiveOperation,
      createOperation,
      getOrCreateActiveOperation,
      createAnnotation,
      listAnnotations,
      getSummary,
      finishActiveOperation,
      getPendingAnnotations,
      buildSyncPayload,
      markAnnotationSyncing,
      markAnnotationSynced,
      markAnnotationSyncError,
      clearAnnotations,
    }),
    [database],
  );
}
