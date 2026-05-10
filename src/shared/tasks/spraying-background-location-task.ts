import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import * as Location from 'expo-location';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import * as TaskManager from 'expo-task-manager';
import { initializeDatabases } from '@/data/services/sqlite/initialize-sqlite-database';
import {
  SPRAYING_BACKGROUND_LOCATION_TASK,
  SPRAYING_BACKGROUND_SESSION_ID_KEY,
  SPRAYING_MOCK_ROUTE_CONFIG_KEY,
} from '@/shared/constants/spraying-background-location';
import {
  buildStraightMockRoute,
  getMockRoutePointId,
  MOCK_LOCATION_UPDATE_INTERVAL_MS,
  type SprayingMockRouteConfig,
} from '@/shared/utils/spraying-mock-route';
import {
  type AcceptedRouteLocation,
  getRoutePointFromLocation,
  shouldAcceptSprayingRouteLocation,
} from '@/shared/utils/spraying-route-location-filter';

interface BackgroundLocationTaskData {
  locations: Location.LocationObject[];
}

interface LastRoutePointRow {
  latitude: number;
  longitude: number;
  gps_timestamp: number | null;
}

async function getMockRouteConfig(sessionId: string): Promise<SprayingMockRouteConfig | null> {
  const rawConfig = await AsyncStorage.getItem(SPRAYING_MOCK_ROUTE_CONFIG_KEY);
  if (!rawConfig) {
    return null;
  }

  try {
    const config = JSON.parse(rawConfig) as SprayingMockRouteConfig;
    return config.sessionId === sessionId ? config : null;
  } catch {
    await AsyncStorage.removeItem(SPRAYING_MOCK_ROUTE_CONFIG_KEY);
    return null;
  }
}

async function getLastAcceptedLocation(
  database: SQLiteDatabase,
  sessionId: string,
): Promise<AcceptedRouteLocation | null> {
  const row = await database.getFirstAsync<LastRoutePointRow>(
    'SELECT latitude, longitude, gps_timestamp FROM spraying_route_points ' +
      'WHERE session_id = ? ORDER BY gps_timestamp DESC LIMIT 1',
    [sessionId],
  );

  if (!row || row.gps_timestamp == null) {
    return null;
  }

  return {
    point: {
      latitude: row.latitude,
      longitude: row.longitude,
    },
    timestamp: row.gps_timestamp,
  };
}

async function saveMockRouteProgress(sessionId: string, config: SprayingMockRouteConfig): Promise<void> {
  const route = buildStraightMockRoute(config.startCoordinate, config.endCoordinate);
  const elapsedMs = Math.max(Date.now() - config.startedAt, 0);
  const lastRouteIndex = Math.min(route.length - 1, Math.floor(elapsedMs / MOCK_LOCATION_UPDATE_INTERVAL_MS));

  const database = await openDatabaseAsync('pomar-na-mao.db', { useNewConnection: true });
  await initializeDatabases(database);

  const statement = await database.prepareAsync(
    'INSERT OR IGNORE INTO spraying_route_points (id, session_id, latitude, longitude, gps_timestamp, accuracy) ' +
      'VALUES ($id, $sessionId, $latitude, $longitude, $gpsTimestamp, $accuracy)',
  );

  try {
    await database.execAsync('BEGIN TRANSACTION');

    for (let routeIndex = 0; routeIndex <= lastRouteIndex; routeIndex += 1) {
      const point = route[routeIndex];

      await statement.executeAsync({
        $id: getMockRoutePointId(sessionId, routeIndex),
        $sessionId: sessionId,
        $latitude: point.latitude,
        $longitude: point.longitude,
        $gpsTimestamp: config.startedAt + routeIndex * MOCK_LOCATION_UPDATE_INTERVAL_MS,
        $accuracy: 1,
      });
    }

    await database.execAsync('COMMIT');
  } catch (error) {
    await database.execAsync('ROLLBACK');
    throw error;
  } finally {
    await statement.finalizeAsync();
    await database.closeAsync();
  }

  if (lastRouteIndex >= route.length - 1) {
    await AsyncStorage.removeItem(SPRAYING_MOCK_ROUTE_CONFIG_KEY);
  }
}

async function saveBackgroundLocations(sessionId: string, locations: Location.LocationObject[]): Promise<void> {
  if (locations.length === 0) {
    return;
  }

  const database = await openDatabaseAsync('pomar-na-mao.db', { useNewConnection: true });
  await initializeDatabases(database);

  let lastAcceptedLocation = await getLastAcceptedLocation(database, sessionId);
  const statement = await database.prepareAsync(
    'INSERT OR IGNORE INTO spraying_route_points (id, session_id, latitude, longitude, gps_timestamp, accuracy) ' +
      'VALUES ($id, $sessionId, $latitude, $longitude, $gpsTimestamp, $accuracy)',
  );

  try {
    await database.execAsync('BEGIN TRANSACTION');

    for (const location of locations) {
      if (!shouldAcceptSprayingRouteLocation(location, lastAcceptedLocation)) {
        continue;
      }

      const point = getRoutePointFromLocation(location);
      const timestamp = location.timestamp || Date.now();

      await statement.executeAsync({
        $id: randomUUID(),
        $sessionId: sessionId,
        $latitude: point.latitude,
        $longitude: point.longitude,
        $gpsTimestamp: timestamp,
        $accuracy: location.coords.accuracy ?? null,
      });

      lastAcceptedLocation = {
        point,
        timestamp,
      };
    }

    await database.execAsync('COMMIT');
  } catch (error) {
    await database.execAsync('ROLLBACK');
    throw error;
  } finally {
    await statement.finalizeAsync();
    await database.closeAsync();
  }
}

if (!TaskManager.isTaskDefined(SPRAYING_BACKGROUND_LOCATION_TASK)) {
  TaskManager.defineTask<BackgroundLocationTaskData>(SPRAYING_BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error || !data?.locations) {
      return;
    }

    const sessionId = await AsyncStorage.getItem(SPRAYING_BACKGROUND_SESSION_ID_KEY);
    if (!sessionId) {
      await Location.stopLocationUpdatesAsync(SPRAYING_BACKGROUND_LOCATION_TASK);
      return;
    }

    const mockRouteConfig = await getMockRouteConfig(sessionId);
    if (mockRouteConfig) {
      await saveMockRouteProgress(sessionId, mockRouteConfig);
      return;
    }

    await saveBackgroundLocations(sessionId, data.locations);
  });
}
