import { createSimulationLocation } from './simulation-location';

describe('simulation-location helper', () => {
  it('creates a stationary location object at the selected coordinate', () => {
    const timestamp = 1_785_000_000_000;
    const location = createSimulationLocation({ latitude: -23.1, longitude: -46.1 }, timestamp);

    expect(location.timestamp).toBe(timestamp);
    expect(location.coords.latitude).toBe(-23.1);
    expect(location.coords.longitude).toBe(-46.1);
    expect(location.coords.accuracy).toBe(1);
    expect(location.coords.altitude).toBe(0);
    expect(location.coords.altitudeAccuracy).toBe(1);
    expect(location.coords.speed).toBe(0);
    expect(location.coords.heading).toBeNull();
  });
});
