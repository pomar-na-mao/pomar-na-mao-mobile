import Constants from 'expo-constants';
import { getInspectionDeviceId } from './device';

jest.mock('expo-constants', () => ({
  installationId: 'installation-id',
  sessionId: 'session-id',
}));

describe('getInspectionDeviceId', () => {
  beforeEach(() => {
    Constants.sessionId = 'session-id';
    Constants.installationId = 'installation-id';
  });

  it('prefers the Expo session id', () => {
    expect(getInspectionDeviceId()).toBe('session-id');
  });

  it('falls back to installation id and then unknown-device', () => {
    Constants.sessionId = null as unknown as string;
    expect(getInspectionDeviceId()).toBe('installation-id');

    Constants.installationId = null as unknown as string;
    expect(getInspectionDeviceId()).toBe('unknown-device');
  });
});
