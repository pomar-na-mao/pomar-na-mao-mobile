export type RemoteId = string;
export type LocalId = string;
export type TimestampString = string;
export type JsonString = string;
export type SQLiteBoolean = 0 | 1;

export type RemoteSyncStatus = 'pending' | 'syncing' | 'synced' | 'error';
export type LocalSyncStatus =
  | 'pending'
  | 'pending_create'
  | 'pending_update'
  | 'syncing'
  | 'synced'
  | 'sync_error'
  | 'error';

export interface RemoteTimestamps {
  created_at: TimestampString;
  updated_at?: TimestampString | null;
}

export interface RemoteSyncMetadata {
  local_id?: LocalId | null;
  device_id?: string | null;
  sync_status: RemoteSyncStatus | string;
  synced_at?: TimestampString | null;
}

export interface LocalSyncMetadata {
  local_id?: LocalId | null;
  device_id?: string | null;
  sync_status: LocalSyncStatus | string;
  sync_error?: string | null;
}
