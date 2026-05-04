/* eslint-disable max-len */
import type {
  Product,
  SprayingPlant,
  SprayingProduct,
  SprayingRoutePoint,
  SprayingSession,
} from '@/domain/models/spraying/spraying.model';
import { randomUUID } from 'expo-crypto';
import { useSQLiteContext } from 'expo-sqlite';

// Buffer em memória para pontos GPS (não grava a cada ponto)
let routePointBuffer: SprayingRoutePoint[] = [];
let routePointFlushPromise: Promise<void> = Promise.resolve();

export function useSprayingSqliteService() {
  const database = useSQLiteContext();

  // ─── Sessions ────────────────────────────────────────────────────────────────

  async function startSession(operatorName?: string, region?: string): Promise<string> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const statement = await database.prepareAsync(
      'INSERT INTO spraying_sessions (id, started_at, status, operator_name, region, created_at, dirty, deleted) ' +
        'VALUES ($id, $startedAt, $status, $operatorName, $region, $createdAt, $dirty, $deleted)',
    );

    try {
      await statement.executeAsync({
        $id: id,
        $startedAt: now,
        $status: 'in_progress',
        $operatorName: operatorName ?? null,
        $region: region ?? null,
        $createdAt: now,
        $dirty: 1,
        $deleted: 0,
      });
      return id;
    } catch (error) {
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function finishSession(sessionId: string, notes?: string, waterVolume?: number): Promise<void> {
    const statement = await database.prepareAsync(
      'UPDATE spraying_sessions SET status = $status, ended_at = $endedAt, notes = $notes, water_volume_liters = $waterVolume, dirty = $dirty WHERE id = $id',
    );

    try {
      await statement.executeAsync({
        $status: 'completed',
        $endedAt: new Date().toISOString(),
        $notes: notes ?? null,
        $waterVolume: waterVolume ?? null,
        $dirty: 1,
        $id: sessionId,
      });
    } catch (error) {
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function getSession(sessionId: string): Promise<SprayingSession | null> {
    try {
      const result = await database.getFirstAsync<SprayingSession>(
        'SELECT * FROM spraying_sessions WHERE id = ? AND deleted = 0',
        [sessionId],
      );
      return result ?? null;
    } catch (error) {
      throw error;
    }
  }

  async function getAllSessions(): Promise<SprayingSession[]> {
    try {
      return await database.getAllAsync<SprayingSession>(
        'SELECT * FROM spraying_sessions WHERE deleted = 0 ORDER BY created_at DESC',
      );
    } catch (error) {
      throw error;
    }
  }

  async function isSessionSynced(sessionId: string): Promise<boolean> {
    try {
      const result = await database.getFirstAsync<{ dirty: number }>(
        'SELECT dirty FROM spraying_sessions WHERE id = ?',
        [sessionId],
      );
      return result ? result.dirty === 0 : false;
    } catch (error) {
      throw error;
    }
  }

  async function markSessionSynced(sessionId: string): Promise<void> {
    const statement = await database.prepareAsync(
      'UPDATE spraying_sessions SET dirty = 0, synced_at = $syncedAt WHERE id = $id',
    );

    try {
      await statement.executeAsync({
        $syncedAt: new Date().toISOString(),
        $id: sessionId,
      });
    } catch (error) {
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  // ─── Products ────────────────────────────────────────────────────────────────

  async function getActiveProducts(): Promise<Product[]> {
    try {
      return await database.getAllAsync<Product>(
        'SELECT * FROM products WHERE is_active = 1 AND deleted = 0 ORDER BY name',
      );
    } catch (error) {
      throw error;
    }
  }

  async function saveProducts(products: Product[]): Promise<void> {
    const statement = await database.prepareAsync(
      'INSERT INTO products (id, name, active_ingredient, category, concentration, unit, manufacturer, notes, is_active, created_at, synced_at, dirty, deleted) ' +
        'VALUES ($id, $name, $activeIngredient, $category, $concentration, $unit, $manufacturer, $notes, $isActive, $createdAt, $syncedAt, $dirty, $deleted) ' +
        'ON CONFLICT(id) DO UPDATE SET name = excluded.name, active_ingredient = excluded.active_ingredient, category = excluded.category, concentration = excluded.concentration, unit = excluded.unit, manufacturer = excluded.manufacturer, notes = excluded.notes, is_active = excluded.is_active, synced_at = excluded.synced_at, dirty = 0, deleted = 0',
    );

    const now = new Date().toISOString();

    try {
      await database.execAsync('BEGIN TRANSACTION');

      for (const product of products) {
        await statement.executeAsync({
          $id: product.id,
          $name: product.name,
          $activeIngredient: product.active_ingredient ?? null,
          $category: product.category ?? null,
          $concentration: product.concentration ?? null,
          $unit: product.unit ?? 'ml/L',
          $manufacturer: product.manufacturer ?? null,
          $notes: product.notes ?? null,
          $isActive: Number(product.is_active ?? 1),
          $createdAt: product.created_at ?? null,
          $syncedAt: now,
          $dirty: 0,
          $deleted: 0,
        });
      }

      await database.execAsync('COMMIT');
    } catch (error) {
      await database.execAsync('ROLLBACK');
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function addProductToSession(
    sessionId: string,
    productId: string,
    dose: number,
    doseUnit = 'ml/L',
  ): Promise<void> {
    const id = randomUUID();
    const statement = await database.prepareAsync(
      'INSERT INTO spraying_products (id, session_id, product_id, dose, dose_unit, dirty, deleted) ' +
        'VALUES ($id, $sessionId, $productId, $dose, $doseUnit, $dirty, $deleted) ' +
        'ON CONFLICT(session_id, product_id) DO UPDATE SET dose = excluded.dose, dose_unit = excluded.dose_unit, dirty = 1',
    );

    try {
      await statement.executeAsync({
        $id: id,
        $sessionId: sessionId,
        $productId: productId,
        $dose: dose,
        $doseUnit: doseUnit,
        $dirty: 1,
        $deleted: 0,
      });
    } catch (error) {
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function removeProductFromSession(sessionId: string, productId: string): Promise<void> {
    const statement = await database.prepareAsync(
      'UPDATE spraying_products SET deleted = 1, dirty = 1 WHERE session_id = $sessionId AND product_id = $productId',
    );

    try {
      await statement.executeAsync({ $sessionId: sessionId, $productId: productId });
    } catch (error) {
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function getSessionProducts(sessionId: string): Promise<SprayingProduct[]> {
    try {
      return await database.getAllAsync<SprayingProduct>(
        'SELECT * FROM spraying_products WHERE session_id = ? AND deleted = 0',
        [sessionId],
      );
    } catch (error) {
      throw error;
    }
  }

  // ─── GPS Route Points (buffer em memória) ────────────────────────────────────

  function bufferRoutePoint(
    sessionId: string,
    coords: { latitude: number; longitude: number; accuracy?: number },
  ): void {
    const point: SprayingRoutePoint = {
      id: randomUUID(),
      session_id: sessionId,
      latitude: coords.latitude,
      longitude: coords.longitude,
      gps_timestamp: Date.now(),
      accuracy: coords.accuracy ?? null,
      synced_at: null,
    };
    routePointBuffer.push(point);
  }

  async function flushRouteBufferNow(): Promise<void> {
    if (routePointBuffer.length === 0) return;

    const pointsToFlush = [...routePointBuffer];
    routePointBuffer = [];
    let transactionStarted = false;

    const statement = await database.prepareAsync(
      'INSERT OR IGNORE INTO spraying_route_points (id, session_id, latitude, longitude, gps_timestamp, accuracy) ' +
        'VALUES ($id, $sessionId, $latitude, $longitude, $gpsTimestamp, $accuracy)',
    );

    try {
      await database.execAsync('BEGIN TRANSACTION');
      transactionStarted = true;

      for (const point of pointsToFlush) {
        await statement.executeAsync({
          $id: point.id,
          $sessionId: point.session_id,
          $latitude: point.latitude,
          $longitude: point.longitude,
          $gpsTimestamp: point.gps_timestamp ?? null,
          $accuracy: point.accuracy ?? null,
        });
      }

      await database.execAsync('COMMIT');
      transactionStarted = false;
    } catch (error) {
      if (transactionStarted) {
        await database.execAsync('ROLLBACK');
      }
      // Devolve os pontos para o buffer se a gravação falhar
      routePointBuffer = [...pointsToFlush, ...routePointBuffer];
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function flushRouteBuffer(): Promise<void> {
    routePointFlushPromise = routePointFlushPromise.then(flushRouteBufferNow, flushRouteBufferNow);
    return routePointFlushPromise;
  }

  // ─── Associated Plants ────────────────────────────────────────────────────────

  async function saveAssociatedPlants(
    sessionId: string,
    plants: { plant_id: string; distance_meters: number }[],
  ): Promise<void> {
    const statement = await database.prepareAsync(
      'INSERT INTO spraying_plants (id, session_id, plant_id, distance_meters, association_method, synced_at, dirty, deleted) ' +
        'VALUES ($id, $sessionId, $plantId, $distanceMeters, $method, $syncedAt, $dirty, $deleted) ' +
        'ON CONFLICT(session_id, plant_id) DO UPDATE SET distance_meters = excluded.distance_meters, synced_at = excluded.synced_at',
    );

    const now = new Date().toISOString();

    try {
      await database.execAsync('BEGIN TRANSACTION');

      for (const plant of plants) {
        await statement.executeAsync({
          $id: randomUUID(),
          $sessionId: sessionId,
          $plantId: plant.plant_id,
          $distanceMeters: plant.distance_meters,
          $method: 'auto',
          $syncedAt: now,
          $dirty: 0,
          $deleted: 0,
        });
      }

      await database.execAsync('COMMIT');
    } catch (error) {
      await database.execAsync('ROLLBACK');
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function getRoutePoints(sessionId: string): Promise<SprayingRoutePoint[]> {
    try {
      return await database.getAllAsync<SprayingRoutePoint>(
        'SELECT * FROM spraying_route_points WHERE session_id = ? ORDER BY gps_timestamp ASC',
        [sessionId],
      );
    } catch (error) {
      throw error;
    }
  }

  async function clearRoutePoints(sessionId: string): Promise<void> {
    routePointFlushPromise = routePointFlushPromise.then(
      async () => {
        routePointBuffer = routePointBuffer.filter((point) => point.session_id !== sessionId);
        await database.runAsync('DELETE FROM spraying_route_points WHERE session_id = ?', [sessionId]);
      },
      async () => {
        routePointBuffer = routePointBuffer.filter((point) => point.session_id !== sessionId);
        await database.runAsync('DELETE FROM spraying_route_points WHERE session_id = ?', [sessionId]);
      },
    );

    return routePointFlushPromise;
  }

  async function getAssociatedPlants(sessionId: string): Promise<SprayingPlant[]> {
    try {
      return await database.getAllAsync<SprayingPlant>(
        'SELECT * FROM spraying_plants WHERE session_id = ? AND deleted = 0 ORDER BY distance_meters ASC',
        [sessionId],
      );
    } catch (error) {
      throw error;
    }
  }

  async function deleteSession(sessionId: string): Promise<void> {
    const statement = await database.prepareAsync('UPDATE spraying_sessions SET deleted = 1, dirty = 1 WHERE id = $id');
    try {
      await statement.executeAsync({ $id: sessionId });
    } catch (error) {
      throw error;
    } finally {
      await statement.finalizeAsync();
    }
  }

  async function hardDeleteSession(sessionId: string): Promise<void> {
    try {
      await database.execAsync('BEGIN TRANSACTION');
      await database.runAsync('DELETE FROM spraying_plants WHERE session_id = ?', [sessionId]);
      await database.runAsync('DELETE FROM spraying_route_points WHERE session_id = ?', [sessionId]);
      await database.runAsync('DELETE FROM spraying_products WHERE session_id = ?', [sessionId]);
      await database.runAsync('DELETE FROM spraying_sessions WHERE id = ?', [sessionId]);
      await database.execAsync('COMMIT');
    } catch (error) {
      await database.execAsync('ROLLBACK');
      throw error;
    }
  }

  return {
    // Sessions
    startSession,
    finishSession,
    getSession,
    getAllSessions,
    isSessionSynced,
    markSessionSynced,
    deleteSession,
    hardDeleteSession,
    // Products
    getActiveProducts,
    saveProducts,
    addProductToSession,
    removeProductFromSession,
    getSessionProducts,
    // GPS buffer
    bufferRoutePoint,
    flushRouteBuffer,
    getRoutePoints,
    clearRoutePoints,
    // Associated plants
    saveAssociatedPlants,
    getAssociatedPlants,
  };
}
