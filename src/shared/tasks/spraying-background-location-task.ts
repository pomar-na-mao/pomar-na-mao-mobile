import { initializeDatabases } from '@/data/services/sqlite/initialize-sqlite-database';
import { createSprayingSqliteService } from '@/data/services/spraying/spraying-sqlite-service';
import { getActiveSprayingTracking } from '@/data/services/spraying/spraying-location-service';
import { SPRAYING_DATABASE_NAME, SPRAYING_LOCATION_TASK } from '@/shared/constants/spraying-background-location';
import { isSprayingLocationAccepted, trackPointToAcceptedLocation } from '@/ui/spraying/helpers/spraying-location';
import * as Location from 'expo-location';
import { openDatabaseAsync } from 'expo-sqlite';
import * as TaskManager from 'expo-task-manager';

interface SprayingLocationTaskData {
  locations: Location.LocationObject[];
}

async function persistSprayingLocations(locations: Location.LocationObject[]) {
  const activeTracking = await getActiveSprayingTracking();
  if (!activeTracking) {
    await Location.stopLocationUpdatesAsync(SPRAYING_LOCATION_TASK);
    return;
  }

  const database = await openDatabaseAsync(SPRAYING_DATABASE_NAME, { useNewConnection: true });

  try {
    await initializeDatabases(database);
    const sqliteService = createSprayingSqliteService(database);
    let lastPoint = await sqliteService.getLastTrackPoint(activeTracking.operationId);
    let previous = lastPoint ? trackPointToAcceptedLocation(lastPoint) : null;

    for (const location of [...locations].sort((left, right) => left.timestamp - right.timestamp)) {
      if (!isSprayingLocationAccepted(location, previous)) {
        continue;
      }

      lastPoint = await sqliteService.appendTrackPoint({
        operationId: activeTracking.operationId,
        recordedAt: new Date(location.timestamp || Date.now()).toISOString(),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speedMps: location.coords.speed ?? null,
        accuracyM: location.coords.accuracy ?? null,
        deviceId: activeTracking.deviceId,
      });
      previous = trackPointToAcceptedLocation(lastPoint);
    }
  } finally {
    await database.closeAsync();
  }
}

if (!TaskManager.isTaskDefined(SPRAYING_LOCATION_TASK)) {
  TaskManager.defineTask<SprayingLocationTaskData>(SPRAYING_LOCATION_TASK, async ({ data, error }) => {
    if (error || !data?.locations?.length) {
      return;
    }

    await persistSprayingLocations(data.locations);
  });
}

export { persistSprayingLocations };
