import Constants from 'expo-constants';

export function getInspectionDeviceId() {
  return Constants.sessionId ?? Constants.installationId ?? 'unknown-device';
}
