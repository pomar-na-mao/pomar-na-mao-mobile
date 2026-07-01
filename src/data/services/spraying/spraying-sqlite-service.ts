import type {
  LocalSprayingCandidatePlant,
  LocalSprayingConfirmedPlant,
  LocalSprayingInput,
  LocalSprayingOperation,
  LocalSprayingRoute,
  LocalSprayingTrackPoint,
  SprayingAggregate,
  SprayingInputDraft,
  SprayingPlant,
  SprayingSetup,
  SprayingSimulationMatch,
  SyncReviewedSprayingPayload,
  SyncReviewedSprayingResult,
} from '@/domain/models/spraying';
import { randomUUID } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

function nowIso() {
  return new Date().toISOString();
}

export interface AppendSprayingTrackPointParams {
  id?: string;
  operationId: string;
  recordedAt: string;
  latitude: number;
  longitude: number;
  speedMps?: number | null;
  accuracyM?: number | null;
  deviceId: string;
}

export interface ConsolidatedSprayingRouteData {
  geojson: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  distanceMeters: number;
  startedAt: string;
  finishedAt: string;
}

export function createSprayingSqliteService(database: SQLiteDatabase) {
  async function getZones() {
    return database.getAllAsync<{ id: string; name: string; description?: string | null }>(
      'SELECT id, name, description FROM local_zones ORDER BY name',
    );
  }

  async function listLoadedZones() {
    return database.getAllAsync<{ id: string; name: string; plantCount: number; loadedAt: string }>(
      `SELECT zone_id AS id, zone_name AS name, COUNT(*) AS plantCount, MAX(loaded_at) AS loadedAt
       FROM local_field_work_zone_plants
       GROUP BY zone_id, zone_name
       HAVING COUNT(*) > 0
       ORDER BY zone_name`,
    );
  }

  async function getZonePlants(zoneId: string): Promise<SprayingPlant[]> {
    const rows = await database.getAllAsync<{
      id: string;
      local_id?: string | null;
      latitude: number;
      longitude: number;
      zone_id?: string | null;
      zone_name?: string | null;
      variety_id?: number | null;
      variety_name?: string | null;
    }>(
      `SELECT plant_id AS id, NULL AS local_id, latitude, longitude, zone_id, zone_name, variety_id, variety_name
       FROM local_field_work_zone_plants
       WHERE zone_id = ?
       ORDER BY plant_id`,
      [zoneId],
    );

    return rows.map((row) => ({
      plantId: row.id,
      latitude: row.latitude,
      longitude: row.longitude,
      zoneId: row.zone_id ?? null,
      zoneName: row.zone_name ?? null,
      varietyId: row.variety_id ?? null,
      varietyName: row.variety_name ?? null,
      reviewStatus: null,
      matchSource: null,
      distanceMeters: null,
    }));
  }

  async function cacheZonePlants(zoneId: string, zoneName: string, plants: SprayingPlant[]) {
    const timestamp = nowIso();

    await database.withTransactionAsync(async () => {
      for (const plant of plants) {
        await database.runAsync(
          `INSERT INTO local_plants (
            id, local_id, latitude, longitude, zone_id, zone_name,
            variety_id, variety_name, is_dead, non_existent,
            created_at, updated_at, sync_status
          ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, 'synced')
          ON CONFLICT(id) DO UPDATE SET
            latitude = excluded.latitude,
            longitude = excluded.longitude,
            zone_id = excluded.zone_id,
            zone_name = excluded.zone_name,
            variety_id = excluded.variety_id,
            variety_name = excluded.variety_name,
            is_dead = 0,
            non_existent = 0,
            updated_at = excluded.updated_at`,
          [
            plant.plantId,
            plant.latitude,
            plant.longitude,
            plant.zoneId ?? zoneId,
            plant.zoneName ?? zoneName,
            plant.varietyId ?? null,
            plant.varietyName ?? null,
            timestamp,
            timestamp,
          ],
        );
      }
    });
  }

  async function createOperation(setup: SprayingSetup, deviceId: string): Promise<LocalSprayingOperation> {
    if (!setup.zoneId || !setup.zoneName || !setup.operatorName.trim() || setup.inputs.length === 0) {
      throw new Error('Zona, operador e ao menos um insumo sao obrigatorios.');
    }

    if (setup.maxDistanceMeters <= 0) {
      throw new Error('O alcance máximo de Pulverização e invalido.');
    }

    const timestamp = nowIso();
    const operationId = randomUUID();
    const operation: LocalSprayingOperation = {
      id: operationId,
      local_id: operationId,
      operation_type_code: 'spraying',
      zone_id: setup.zoneId,
      zone_name: setup.zoneName,
      title: setup.title?.trim() || `Pulverização ${setup.zoneName}`,
      source: 'gps_track',
      started_at: timestamp,
      finished_at: null,
      operator_name: setup.operatorName.trim(),
      machine_name: setup.machineName.trim(),
      tractor_identifier: setup.tractorIdentifier?.trim() || null,
      notes: setup.notes?.trim() || null,
      lifecycle_status: 'draft',
      review_status: 'pending_review',
      min_distance_meters: setup.minDistanceMeters,
      max_distance_meters: setup.maxDistanceMeters,
      candidate_plants_count: 0,
      confirmed_plants_count: 0,
      device_id: deviceId,
      sync_status: 'pending_create',
      remote_field_operation_id: null,
      synced_at: null,
      sync_error: null,
      created_at: timestamp,
      updated_at: timestamp,
    };

    await database.withTransactionAsync(async () => {
      await database.runAsync(
        `INSERT INTO local_spraying_operations (
          id, local_id, operation_type_code, zone_id, zone_name, title, source,
          started_at, finished_at, operator_name, machine_name, tractor_identifier,
          notes, lifecycle_status, review_status, min_distance_meters, max_distance_meters,
          candidate_plants_count, confirmed_plants_count, device_id, sync_status,
          remote_field_operation_id, synced_at, sync_error, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          operation.id,
          operation.local_id,
          operation.operation_type_code,
          operation.zone_id,
          operation.zone_name,
          operation.title ?? null,
          operation.source,
          operation.started_at,
          operation.finished_at ?? null,
          operation.operator_name,
          operation.machine_name,
          operation.tractor_identifier ?? null,
          operation.notes ?? null,
          operation.lifecycle_status,
          operation.review_status,
          operation.min_distance_meters,
          operation.max_distance_meters,
          operation.candidate_plants_count,
          operation.confirmed_plants_count,
          operation.device_id,
          operation.sync_status,
          null,
          null,
          null,
          operation.created_at,
          operation.updated_at,
        ],
      );
      await replaceInputs(operation.id, setup.inputs, deviceId, timestamp);
    });

    return operation;
  }

  async function replaceInputs(
    operationId: string,
    inputs: SprayingInputDraft[],
    deviceId: string,
    timestamp = nowIso(),
  ) {
    await database.runAsync('DELETE FROM local_spraying_inputs WHERE field_operation_local_id = ?', [operationId]);

    for (const input of inputs) {
      if (!input.inputType.trim() || !input.productName.trim()) {
        throw new Error('Tipo e nome do insumo sao obrigatorios.');
      }

      const id = randomUUID();
      await database.runAsync(
        `INSERT INTO local_spraying_inputs (
          id, local_id, field_operation_local_id, input_type, product_name,
          active_ingredient, dose, dose_unit, total_quantity, total_quantity_unit,
          notes, device_id, sync_status, remote_input_id, sync_error, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_create', NULL, NULL, ?)`,
        [
          id,
          id,
          operationId,
          input.inputType.trim(),
          input.productName.trim(),
          input.activeIngredient?.trim() || null,
          input.dose ?? null,
          input.doseUnit?.trim() || null,
          input.totalQuantity ?? null,
          input.totalQuantityUnit?.trim() || null,
          input.notes?.trim() || null,
          deviceId,
          timestamp,
        ],
      );
    }
  }

  async function getOperation(operationId: string): Promise<LocalSprayingOperation | null> {
    return database.getFirstAsync<LocalSprayingOperation>('SELECT * FROM local_spraying_operations WHERE id = ?', [
      operationId,
    ]);
  }

  async function getRecoverableOperation(): Promise<LocalSprayingOperation | null> {
    return database.getFirstAsync<LocalSprayingOperation>(
      `SELECT * FROM local_spraying_operations
       WHERE lifecycle_status NOT IN ('synced')
       ORDER BY updated_at DESC
       LIMIT 1`,
    );
  }

  async function deleteOperation(operationId: string) {
    await database.withTransactionAsync(async () => {
      await database.runAsync('DELETE FROM local_spraying_confirmed_plants WHERE field_operation_local_id = ?', [
        operationId,
      ]);
      await database.runAsync('DELETE FROM local_spraying_candidate_plants WHERE field_operation_local_id = ?', [
        operationId,
      ]);
      await database.runAsync('DELETE FROM local_spraying_inputs WHERE field_operation_local_id = ?', [operationId]);
      await database.runAsync('DELETE FROM local_spraying_routes WHERE field_operation_local_id = ?', [operationId]);
      await database.runAsync('DELETE FROM local_spraying_track_points WHERE field_operation_local_id = ?', [
        operationId,
      ]);
      await database.runAsync('DELETE FROM local_spraying_operations WHERE id = ?', [operationId]);
    });
  }

  async function listTrackPoints(operationId: string): Promise<LocalSprayingTrackPoint[]> {
    return database.getAllAsync<LocalSprayingTrackPoint>(
      `SELECT * FROM local_spraying_track_points
       WHERE field_operation_local_id = ?
       ORDER BY recorded_at, local_id`,
      [operationId],
    );
  }

  async function getLastTrackPoint(operationId: string): Promise<LocalSprayingTrackPoint | null> {
    return database.getFirstAsync<LocalSprayingTrackPoint>(
      `SELECT * FROM local_spraying_track_points
       WHERE field_operation_local_id = ?
       ORDER BY recorded_at DESC, local_id DESC
       LIMIT 1`,
      [operationId],
    );
  }

  async function resetTrackPointsForSimulation(operationId: string) {
    await database.withTransactionAsync(async () => {
      await database.runAsync('DELETE FROM local_spraying_routes WHERE field_operation_local_id = ?', [operationId]);
      await database.runAsync('DELETE FROM local_spraying_track_points WHERE field_operation_local_id = ?', [
        operationId,
      ]);
    });
  }

  async function appendTrackPoint(params: AppendSprayingTrackPointParams): Promise<LocalSprayingTrackPoint> {
    const id = params.id ?? randomUUID();
    const point: LocalSprayingTrackPoint = {
      id,
      local_id: id,
      field_operation_local_id: params.operationId,
      recorded_at: params.recordedAt,
      latitude: params.latitude,
      longitude: params.longitude,
      speed_mps: params.speedMps ?? null,
      accuracy_m: params.accuracyM ?? null,
      device_id: params.deviceId,
      sync_status: 'pending_create',
      remote_track_point_id: null,
      sync_error: null,
      created_at: nowIso(),
    };

    await database.runAsync(
      `INSERT OR IGNORE INTO local_spraying_track_points (
        id, local_id, field_operation_local_id, recorded_at, latitude, longitude,
        speed_mps, accuracy_m, device_id, sync_status, remote_track_point_id,
        sync_error, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        point.id,
        point.local_id,
        point.field_operation_local_id,
        point.recorded_at,
        point.latitude,
        point.longitude,
        point.speed_mps ?? null,
        point.accuracy_m ?? null,
        point.device_id,
        point.sync_status,
        null,
        null,
        point.created_at,
      ],
    );

    return point;
  }

  async function markTracking(operationId: string) {
    await database.runAsync(
      `UPDATE local_spraying_operations
       SET lifecycle_status = 'tracking', started_at = ?, updated_at = ?, sync_error = NULL
       WHERE id = ? AND lifecycle_status IN ('draft', 'tracking')`,
      [nowIso(), nowIso(), operationId],
    );
  }

  async function finishTracking(operationId: string, finishedAt = nowIso()) {
    await database.runAsync(
      `UPDATE local_spraying_operations
       SET lifecycle_status = 'finished', finished_at = ?, updated_at = ?
       WHERE id = ? AND lifecycle_status = 'tracking'`,
      [finishedAt, finishedAt, operationId],
    );
  }

  async function saveConsolidatedRoute(
    operation: LocalSprayingOperation,
    route: ConsolidatedSprayingRouteData,
  ): Promise<LocalSprayingRoute> {
    const id = randomUUID();
    const localRoute: LocalSprayingRoute = {
      id,
      local_id: id,
      field_operation_local_id: operation.id,
      route_geojson: JSON.stringify(route.geojson),
      distance_meters: route.distanceMeters,
      started_at: route.startedAt,
      finished_at: route.finishedAt,
      device_id: operation.device_id,
      sync_status: 'pending_create',
      remote_route_id: null,
      sync_error: null,
      created_at: nowIso(),
    };

    await database.runAsync(
      `INSERT INTO local_spraying_routes (
        id, local_id, field_operation_local_id, route_geojson, distance_meters,
        started_at, finished_at, device_id, sync_status, remote_route_id,
        sync_error, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?)
      ON CONFLICT(field_operation_local_id) DO UPDATE SET
        route_geojson = excluded.route_geojson,
        distance_meters = excluded.distance_meters,
        started_at = excluded.started_at,
        finished_at = excluded.finished_at,
        sync_status = 'pending_create',
        remote_route_id = NULL,
        sync_error = NULL`,
      [
        localRoute.id,
        localRoute.local_id,
        localRoute.field_operation_local_id,
        localRoute.route_geojson,
        localRoute.distance_meters,
        localRoute.started_at,
        localRoute.finished_at,
        localRoute.device_id,
        localRoute.sync_status,
        localRoute.created_at,
      ],
    );

    return localRoute;
  }

  async function saveSimulation(operationId: string, matches: SprayingSimulationMatch[]) {
    const timestamp = nowIso();

    await database.withTransactionAsync(async () => {
      const existing = await database.getAllAsync<LocalSprayingCandidatePlant>(
        'SELECT * FROM local_spraying_candidate_plants WHERE field_operation_local_id = ?',
        [operationId],
      );
      const explicitOverrides = new Map(
        existing
          .filter((candidate) => candidate.review_status === 'removed' || candidate.review_status === 'manually_added')
          .map((candidate) => [candidate.plant_id, candidate]),
      );

      await database.runAsync(
        `DELETE FROM local_spraying_candidate_plants
         WHERE field_operation_local_id = ?
           AND review_status NOT IN ('removed', 'manually_added')`,
        [operationId],
      );
      await database.runAsync(
        `DELETE FROM local_spraying_confirmed_plants
         WHERE field_operation_local_id = ? AND match_source = 'auto_matched'`,
        [operationId],
      );

      for (const match of matches) {
        const override = explicitOverrides.get(match.plantId);
        if (override?.review_status === 'manually_added') {
          continue;
        }

        const id = override?.id ?? randomUUID();
        await database.runAsync(
          `INSERT INTO local_spraying_candidate_plants (
            id, local_id, field_operation_local_id, plant_id, plant_local_id,
            nearest_track_point_local_id, matched_at, distance_meters, match_source,
            review_status, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, 'auto_matched', ?, NULL, ?, ?)
          ON CONFLICT(field_operation_local_id, plant_id) DO UPDATE SET
            nearest_track_point_local_id = excluded.nearest_track_point_local_id,
            matched_at = excluded.matched_at,
            distance_meters = excluded.distance_meters,
            updated_at = excluded.updated_at`,
          [
            id,
            id,
            operationId,
            match.plantId,
            match.nearestTrackPointLocalId ?? null,
            match.matchedAt ?? null,
            match.distanceMeters,
            override?.review_status ?? 'candidate',
            override?.created_at ?? timestamp,
            timestamp,
          ],
        );
      }

      await refreshReviewCounts(operationId);
      await database.runAsync(
        `UPDATE local_spraying_operations
         SET lifecycle_status = 'simulated', review_status = 'pending_review', updated_at = ?
         WHERE id = ?`,
        [timestamp, operationId],
      );
    });
  }

  async function setPlantConfirmed(params: {
    operationId: string;
    plantId: string;
    confirmed: boolean;
    deviceId: string;
    nearestTrackPointLocalId?: string | null;
    matchedAt?: string | null;
    distanceMeters?: number | null;
    notes?: string | null;
  }) {
    const timestamp = nowIso();
    const existingCandidate = await database.getFirstAsync<LocalSprayingCandidatePlant>(
      `SELECT * FROM local_spraying_candidate_plants
       WHERE field_operation_local_id = ? AND plant_id = ?`,
      [params.operationId, params.plantId],
    );
    const isManual = !existingCandidate || existingCandidate.review_status === 'manually_added';
    const matchSource = isManual ? 'manual_added' : 'auto_matched';

    await database.withTransactionAsync(async () => {
      const candidateId = existingCandidate?.id ?? randomUUID();
      await database.runAsync(
        `INSERT INTO local_spraying_candidate_plants (
          id, local_id, field_operation_local_id, plant_id, plant_local_id,
          nearest_track_point_local_id, matched_at, distance_meters, match_source,
          review_status, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(field_operation_local_id, plant_id) DO UPDATE SET
          review_status = excluded.review_status,
          match_source = excluded.match_source,
          notes = excluded.notes,
          updated_at = excluded.updated_at`,
        [
          candidateId,
          candidateId,
          params.operationId,
          params.plantId,
          params.nearestTrackPointLocalId ?? existingCandidate?.nearest_track_point_local_id ?? null,
          params.matchedAt ?? existingCandidate?.matched_at ?? null,
          params.distanceMeters ?? existingCandidate?.distance_meters ?? null,
          matchSource,
          params.confirmed ? (isManual ? 'manually_added' : 'confirmed') : 'removed',
          params.notes ?? existingCandidate?.notes ?? null,
          existingCandidate?.created_at ?? timestamp,
          timestamp,
        ],
      );

      if (params.confirmed) {
        const confirmedId = randomUUID();
        await database.runAsync(
          `INSERT INTO local_spraying_confirmed_plants (
            id, local_id, field_operation_local_id, plant_id, plant_local_id,
            nearest_track_point_local_id, matched_at, distance_meters, match_source,
            status, notes, device_id, sync_status, remote_history_id, sync_error,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, 'confirmed', ?, ?, 'pending_create', NULL, NULL, ?, ?)
          ON CONFLICT(field_operation_local_id, plant_id) DO UPDATE SET
            nearest_track_point_local_id = excluded.nearest_track_point_local_id,
            matched_at = excluded.matched_at,
            distance_meters = excluded.distance_meters,
            match_source = excluded.match_source,
            notes = excluded.notes,
            sync_status = 'pending_create',
            remote_history_id = NULL,
            sync_error = NULL,
            updated_at = excluded.updated_at`,
          [
            confirmedId,
            confirmedId,
            params.operationId,
            params.plantId,
            params.nearestTrackPointLocalId ?? existingCandidate?.nearest_track_point_local_id ?? null,
            params.matchedAt ?? existingCandidate?.matched_at ?? null,
            params.distanceMeters ?? existingCandidate?.distance_meters ?? null,
            matchSource,
            params.notes ?? existingCandidate?.notes ?? null,
            params.deviceId,
            timestamp,
            timestamp,
          ],
        );
      } else {
        await database.runAsync(
          `DELETE FROM local_spraying_confirmed_plants
           WHERE field_operation_local_id = ? AND plant_id = ?`,
          [params.operationId, params.plantId],
        );
      }

      await refreshReviewCounts(params.operationId);
    });
  }

  async function confirmAllAutomaticCandidates(operationId: string, deviceId: string) {
    const candidates = await database.getAllAsync<LocalSprayingCandidatePlant>(
      `SELECT * FROM local_spraying_candidate_plants
       WHERE field_operation_local_id = ? AND review_status = 'candidate'`,
      [operationId],
    );

    for (const candidate of candidates) {
      await setPlantConfirmed({
        operationId,
        plantId: candidate.plant_id,
        confirmed: true,
        deviceId,
        nearestTrackPointLocalId: candidate.nearest_track_point_local_id,
        matchedAt: candidate.matched_at,
        distanceMeters: candidate.distance_meters,
        notes: candidate.notes,
      });
    }
  }

  async function markReviewed(operationId: string) {
    await refreshReviewCounts(operationId);
    await database.runAsync(
      `UPDATE local_spraying_operations
       SET lifecycle_status = 'reviewed', review_status = 'reviewed', updated_at = ?
       WHERE id = ? AND lifecycle_status IN ('simulated', 'reviewed', 'sync_error')`,
      [nowIso(), operationId],
    );
  }

  async function refreshReviewCounts(operationId: string) {
    const candidateCount = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) AS count FROM local_spraying_candidate_plants
       WHERE field_operation_local_id = ? AND match_source = 'auto_matched'`,
      [operationId],
    );
    const confirmedCount = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) AS count FROM local_spraying_confirmed_plants
       WHERE field_operation_local_id = ?`,
      [operationId],
    );
    await database.runAsync(
      `UPDATE local_spraying_operations
       SET candidate_plants_count = ?, confirmed_plants_count = ?, updated_at = ?
       WHERE id = ?`,
      [candidateCount?.count ?? 0, confirmedCount?.count ?? 0, nowIso(), operationId],
    );
  }

  async function getAggregate(operationId: string): Promise<SprayingAggregate | null> {
    const operation = await getOperation(operationId);
    if (!operation) {
      return null;
    }

    const [trackPoints, route, inputs, plants, candidates, confirmedPlants] = await Promise.all([
      listTrackPoints(operationId),
      database.getFirstAsync<LocalSprayingRoute>(
        'SELECT * FROM local_spraying_routes WHERE field_operation_local_id = ?',
        [operationId],
      ),
      database.getAllAsync<LocalSprayingInput>(
        'SELECT * FROM local_spraying_inputs WHERE field_operation_local_id = ? ORDER BY created_at',
        [operationId],
      ),
      getZonePlants(operation.zone_id),
      database.getAllAsync<LocalSprayingCandidatePlant>(
        'SELECT * FROM local_spraying_candidate_plants WHERE field_operation_local_id = ? ORDER BY plant_id',
        [operationId],
      ),
      database.getAllAsync<LocalSprayingConfirmedPlant>(
        'SELECT * FROM local_spraying_confirmed_plants WHERE field_operation_local_id = ? ORDER BY plant_id',
        [operationId],
      ),
    ]);
    const candidatesByPlant = new Map(candidates.map((candidate) => [candidate.plant_id, candidate]));

    return {
      operation,
      trackPoints,
      route: route ?? null,
      inputs,
      plants: plants.map((plant) => {
        const candidate = candidatesByPlant.get(plant.plantId);
        return {
          ...plant,
          reviewStatus: candidate?.review_status ?? null,
          matchSource: candidate?.match_source ?? null,
          distanceMeters: candidate?.distance_meters ?? null,
        };
      }),
      candidates,
      confirmedPlants,
      summary: {
        trackPoints: trackPoints.length,
        routeDistanceMeters: route?.distance_meters ?? 0,
        candidatePlants: operation.candidate_plants_count,
        confirmedPlants: operation.confirmed_plants_count,
      },
    };
  }

  async function buildSyncPayload(operationId: string): Promise<SyncReviewedSprayingPayload> {
    const aggregate = await getAggregate(operationId);
    if (!aggregate) {
      throw new Error('Operacao de Pulverização local nao encontrada.');
    }
    if (!['reviewed', 'sync_error'].includes(aggregate.operation.lifecycle_status)) {
      throw new Error('A Pulverização precisa estar revisada antes da sincronizacao.');
    }
    if (!aggregate.operation.finished_at || !aggregate.route) {
      throw new Error('A Pulverização nao possui uma rota finalizada.');
    }

    return {
      localOperationId: aggregate.operation.local_id,
      deviceId: aggregate.operation.device_id,
      operation: {
        zoneId: aggregate.operation.zone_id,
        title: aggregate.operation.title ?? null,
        source: 'gps_track',
        startedAt: aggregate.operation.started_at,
        finishedAt: aggregate.operation.finished_at,
        operatorName: aggregate.operation.operator_name,
        machineName: aggregate.operation.machine_name,
        tractorIdentifier: aggregate.operation.tractor_identifier ?? null,
        notes: aggregate.operation.notes ?? null,
        minDistanceMeters: aggregate.operation.min_distance_meters,
        maxDistanceMeters: aggregate.operation.max_distance_meters,
      },
      trackPoints: aggregate.trackPoints.map((point) => ({
        localId: point.local_id,
        recordedAt: point.recorded_at,
        latitude: point.latitude,
        longitude: point.longitude,
        speedMps: point.speed_mps ?? null,
        accuracyM: point.accuracy_m ?? null,
      })),
      route: {
        localId: aggregate.route.local_id,
        geojson: JSON.parse(aggregate.route.route_geojson),
        distanceMeters: aggregate.route.distance_meters,
        startedAt: aggregate.route.started_at,
        finishedAt: aggregate.route.finished_at,
      },
      inputs: aggregate.inputs.map((input) => ({
        localId: input.local_id,
        inputType: input.input_type,
        productName: input.product_name,
        activeIngredient: input.active_ingredient ?? null,
        dose: input.dose ?? null,
        doseUnit: input.dose_unit ?? null,
        totalQuantity: input.total_quantity ?? null,
        totalQuantityUnit: input.total_quantity_unit ?? null,
        notes: input.notes ?? null,
      })),
      confirmedPlants: aggregate.confirmedPlants.map((plant) => ({
        localId: plant.local_id,
        plantId: plant.plant_id,
        nearestTrackPointLocalId: plant.nearest_track_point_local_id ?? null,
        matchedAt: plant.matched_at ?? null,
        distanceMeters: plant.distance_meters ?? null,
        matchSource: plant.match_source,
        notes: plant.notes ?? null,
      })),
    };
  }

  async function markSyncing(operationId: string) {
    await database.runAsync(
      `UPDATE local_spraying_operations
       SET lifecycle_status = 'syncing', sync_status = 'syncing', sync_error = NULL, updated_at = ?
       WHERE id = ? AND lifecycle_status IN ('reviewed', 'sync_error')`,
      [nowIso(), operationId],
    );
  }

  async function markSynced(operationId: string, result: SyncReviewedSprayingResult) {
    const timestamp = result.synced_at ?? nowIso();
    await database.withTransactionAsync(async () => {
      await database.runAsync(
        `UPDATE local_spraying_operations
         SET lifecycle_status = 'synced', review_status = 'synced', sync_status = 'synced',
             remote_field_operation_id = ?, synced_at = ?, sync_error = NULL, updated_at = ?
         WHERE id = ?`,
        [result.field_operation_id, timestamp, timestamp, operationId],
      );
      await database.runAsync(
        `UPDATE local_spraying_track_points
         SET sync_status = 'synced', sync_error = NULL
         WHERE field_operation_local_id = ?`,
        [operationId],
      );
      await database.runAsync(
        `UPDATE local_spraying_routes
         SET sync_status = 'synced', remote_route_id = ?, sync_error = NULL
         WHERE field_operation_local_id = ?`,
        [result.route_id ?? null, operationId],
      );
      await database.runAsync(
        `UPDATE local_spraying_inputs
         SET sync_status = 'synced', sync_error = NULL
         WHERE field_operation_local_id = ?`,
        [operationId],
      );
      await database.runAsync(
        `UPDATE local_spraying_confirmed_plants
         SET sync_status = 'synced', sync_error = NULL, updated_at = ?
         WHERE field_operation_local_id = ?`,
        [timestamp, operationId],
      );
    });
  }

  async function markSyncError(operationId: string, message: string) {
    await database.runAsync(
      `UPDATE local_spraying_operations
       SET lifecycle_status = 'sync_error', sync_status = 'sync_error',
           sync_error = ?, updated_at = ?
       WHERE id = ?`,
      [message, nowIso(), operationId],
    );
  }

  return {
    getZones,
    listLoadedZones,
    getZonePlants,
    cacheZonePlants,
    createOperation,
    deleteOperation,
    replaceInputs,
    getOperation,
    getRecoverableOperation,
    listTrackPoints,
    getLastTrackPoint,
    resetTrackPointsForSimulation,
    appendTrackPoint,
    markTracking,
    finishTracking,
    saveConsolidatedRoute,
    saveSimulation,
    setPlantConfirmed,
    confirmAllAutomaticCandidates,
    markReviewed,
    getAggregate,
    buildSyncPayload,
    markSyncing,
    markSynced,
    markSyncError,
  };
}

export type SprayingSqliteService = ReturnType<typeof createSprayingSqliteService>;
