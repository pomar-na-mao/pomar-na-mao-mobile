export const INITIAL_SYNC_TABLES = {
  varieties: 'local_varieties',
  occurrenceTypes: 'local_occurrence_types',
  operationTypes: 'local_operation_types',
  zones: 'local_zones',
  plants: 'local_plants',
  plantOccurrences: 'local_plant_occurrences',
  fieldOperations: 'local_field_operations',
  inspectionTargets: 'local_inspection_targets',
  syncQueue: 'sync_queue',
} as const;

export const INITIAL_SYNC_STATUSES = {
  pending: 'pending',
  pendingCreate: 'pending_create',
  pendingUpdate: 'pending_update',
  syncing: 'syncing',
  synced: 'synced',
  syncError: 'sync_error',
  error: 'error',
} as const;

export const SYNC_QUEUE_ACTIONS = {
  create: 'create',
  update: 'update',
  delete: 'delete',
  resolve: 'resolve',
} as const;

export type InitialSyncTableName = (typeof INITIAL_SYNC_TABLES)[keyof typeof INITIAL_SYNC_TABLES];
export type InitialSyncStatus = (typeof INITIAL_SYNC_STATUSES)[keyof typeof INITIAL_SYNC_STATUSES];
export type SyncQueueAction = (typeof SYNC_QUEUE_ACTIONS)[keyof typeof SYNC_QUEUE_ACTIONS];
