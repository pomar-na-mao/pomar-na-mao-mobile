export const SPRAYING_LOCATION_TASK = 'pomar-na-mao-spraying-location';
export const SPRAYING_ACTIVE_OPERATION_KEY = '@pomar-na-mao/spraying/active-operation';
export const SPRAYING_DATABASE_NAME = 'pomar-na-mao.db';

export interface ActiveSprayingTracking {
  operationId: string;
  deviceId: string;
}
