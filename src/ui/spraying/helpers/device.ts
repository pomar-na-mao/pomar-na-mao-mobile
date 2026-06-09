import Constants from 'expo-constants';

export function getSprayingDeviceId() {
  return Constants.sessionId ?? Constants.installationId ?? 'unknown-device';
}
