import { sprayingPlantsFixture, sprayingTrackPointsFixture } from '@/test/spraying/fixtures';
import { consolidateSprayingRoute, findNearestPointOnSprayingRoute, simulateSprayingPlants } from './spraying-route';

describe('spraying route helpers', () => {
  it('consolidates points chronologically using GeoJSON longitude-latitude order', () => {
    const route = consolidateSprayingRoute([...sprayingTrackPointsFixture].reverse());

    expect(route.geojson).toEqual({
      type: 'LineString',
      coordinates: [
        [-49, -23],
        [-48.9999, -23],
      ],
    });
    expect(route.distanceMeters).toBeGreaterThan(10);
    expect(route.startedAt).toBe('2026-06-07T12:00:00.000Z');
  });

  it('requires at least two accepted points', () => {
    expect(() => consolidateSprayingRoute(sprayingTrackPointsFixture.slice(0, 1))).toThrow('pelo menos dois pontos');
  });

  it('finds the shortest distance to a sparse route segment', () => {
    const nearest = findNearestPointOnSprayingRoute(sprayingPlantsFixture[0], sprayingTrackPointsFixture);

    expect(nearest).not.toBeNull();
    expect(nearest?.segmentIndex).toBe(0);
    expect(nearest?.distanceMeters).toBeGreaterThanOrEqual(3.5);
    expect(nearest?.distanceMeters).toBeLessThanOrEqual(4);
  });

  it('classifies all plants within spray reach (0 to maxDistanceMeters)', () => {
    const matches = simulateSprayingPlants({
      plants: [
        sprayingPlantsFixture[0],
        { ...sprayingPlantsFixture[0], plantId: 'close-plant', latitude: -22.999995 },
        { ...sprayingPlantsFixture[0], plantId: 'too-far', latitude: -22.9998 },
      ],
      points: sprayingTrackPointsFixture,
    });

    expect(matches.map((match) => match.plantId)).toEqual(['plant-1', 'close-plant']);
  });

  it('excludes plants beyond maxDistanceMeters', () => {
    const matches = simulateSprayingPlants({
      plants: [{ ...sprayingPlantsFixture[0], plantId: 'far-away', latitude: -22.999 }],
      points: sprayingTrackPointsFixture,
      maxDistanceMeters: 4,
    });

    expect(matches).toHaveLength(0);
  });

  it('rejects an invalid maxDistanceMeters', () => {
    expect(() =>
      simulateSprayingPlants({
        plants: sprayingPlantsFixture,
        points: sprayingTrackPointsFixture,
        maxDistanceMeters: 0,
      }),
    ).toThrow('faixa lateral');

    expect(() =>
      simulateSprayingPlants({
        plants: sprayingPlantsFixture,
        points: sprayingTrackPointsFixture,
        maxDistanceMeters: -1,
      }),
    ).toThrow('faixa lateral');
  });
});
