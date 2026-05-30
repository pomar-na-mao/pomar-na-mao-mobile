import { inspectionLocation, inspectionPlant, secondInspectionPlant } from '@/test/inspection/fixtures';
import {
  findNearestInspectionPlant,
  MEANINGFUL_DISTANCE_CHANGE_METERS,
  shouldKeepCurrentNearestPlant,
  shouldPersistNearestPlant,
} from './nearest-plant';

describe('nearest-plant helpers', () => {
  it('returns null when there are no plants', () => {
    expect(findNearestInspectionPlant(inspectionLocation, [])).toBeNull();
  });

  it('finds the nearest plant by distance', () => {
    const farPlant = { ...inspectionPlant, latitude: -23.2, longitude: -46.2, plantId: 'far-plant' };
    const result = findNearestInspectionPlant(inspectionLocation, [farPlant, secondInspectionPlant]);

    expect(result?.plant.plantId).toBe(secondInspectionPlant.plantId);
    expect(result?.distance).toBeGreaterThanOrEqual(0);
  });

  it('keeps the current nearest plant when the new candidate is inside the tie margin', () => {
    const shouldKeep = shouldKeepCurrentNearestPlant({
      candidateDistanceMeters: 1,
      candidatePlantId: secondInspectionPlant.plantId,
      currentLocation: inspectionLocation,
      currentNearestPlant: {
        ...inspectionPlant,
        distanceMeters: 1.1,
        latitude: inspectionLocation.coords.latitude,
        longitude: inspectionLocation.coords.longitude + 0.00001,
      },
    });

    expect(shouldKeep).toBe(true);
  });

  it('does not keep the current nearest plant when the candidate is the same plant or clearly closer', () => {
    expect(
      shouldKeepCurrentNearestPlant({
        candidateDistanceMeters: 1,
        candidatePlantId: inspectionPlant.plantId,
        currentLocation: inspectionLocation,
        currentNearestPlant: inspectionPlant,
      }),
    ).toBe(false);

    expect(
      shouldKeepCurrentNearestPlant({
        candidateDistanceMeters: 0.1,
        candidatePlantId: secondInspectionPlant.plantId,
        currentLocation: inspectionLocation,
        currentNearestPlant: {
          ...inspectionPlant,
          latitude: inspectionLocation.coords.latitude,
          longitude: inspectionLocation.coords.longitude + 0.001,
        },
      }),
    ).toBe(false);
  });

  it('persists nearest plant changes only when plant or meaningful distance changes', () => {
    expect(
      shouldPersistNearestPlant({
        candidateDistanceMeters: 10,
        candidatePlantId: inspectionPlant.plantId,
        lastPersistedNearest: null,
      }),
    ).toBe(true);

    expect(
      shouldPersistNearestPlant({
        candidateDistanceMeters: 10.1,
        candidatePlantId: inspectionPlant.plantId,
        lastPersistedNearest: { distance: 10, plantId: inspectionPlant.plantId },
      }),
    ).toBe(false);

    expect(
      shouldPersistNearestPlant({
        candidateDistanceMeters: 10 + MEANINGFUL_DISTANCE_CHANGE_METERS,
        candidatePlantId: inspectionPlant.plantId,
        lastPersistedNearest: { distance: 10, plantId: inspectionPlant.plantId },
      }),
    ).toBe(true);

    expect(
      shouldPersistNearestPlant({
        candidateDistanceMeters: 10,
        candidatePlantId: secondInspectionPlant.plantId,
        lastPersistedNearest: { distance: 10, plantId: inspectionPlant.plantId },
      }),
    ).toBe(true);
  });
});
