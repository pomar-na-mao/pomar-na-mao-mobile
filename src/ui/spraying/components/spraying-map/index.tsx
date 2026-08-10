import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { PlantMapMarkers, type PlantMapMarkerData } from '@/ui/shared/components/plant-map-markers';
import { PlantMapDiagnostics } from '@/ui/shared/components/plant-map-diagnostics';
import {
  createPlantMapRegion,
  type PlantMapClusterVisualization,
} from '@/ui/shared/components/plant-map-markers/visualization';
import { UserMarkerLocation } from '@/ui/shared/components/user-marker-location';
import { usePlantMapVisualization } from '@/ui/shared/hooks/use-plant-map-visualization';
import { SprayingRouteSimulation } from '@/ui/spraying/components/spraying-route-simulation';
import {
  buildSprayingSimulationRoute,
  createSprayingSimulationLocation,
  EMPTY_SPRAYING_SIMULATION_POINTS,
  SPRAYING_SIMULATION_LOCATION_INTERVAL_MS,
  type SprayingSimulationPointIndex,
  type SprayingSimulationPoints,
} from '@/ui/spraying/helpers/spraying-route-simulation';
import { useSpraying } from '@/ui/spraying/view-models/use-spraying';
import type * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type LatLng } from 'react-native-maps';
import { darkMapStyle } from '../../../../../mapStyle';

const AFFECTED_PLANT_MARKER_COLORS = {
  border: '#92400E',
  fill: '#F59E0B',
} as const;
const SIMULATION_POINT_MARKER_COLOR = '#DC2626';

export function SprayingMap() {
  const theme = useColorScheme() ?? 'light';
  const {
    aggregate,
    currentLocation,
    prepareRouteSimulation,
    recordSimulatedLocation,
    selectedZonePlants,
    togglePlant,
  } = useSpraying();
  const plants = aggregate?.plants ?? selectedZonePlants ?? [];
  const simulationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const [simulationPoints, setSimulationPoints] = useState<SprayingSimulationPoints>(EMPTY_SPRAYING_SIMULATION_POINTS);
  const [selectedSimulationPointIndex, setSelectedSimulationPointIndex] = useState<SprayingSimulationPointIndex | null>(
    null,
  );
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulatedLocation, setSimulatedLocation] = useState<Location.LocationObject | null>(null);
  const routeCoordinates = useMemo(
    () =>
      aggregate?.trackPoints.map((point) => ({
        latitude: point.latitude,
        longitude: point.longitude,
      })) ?? [],
    [aggregate?.trackPoints],
  );
  const simulationRoutePreview = useMemo(() => buildSprayingSimulationRoute(simulationPoints), [simulationPoints]);
  const visibleLocation = isSimulationRunning ? (simulatedLocation ?? currentLocation) : currentLocation;
  const center = visibleLocation?.coords ?? plants[0] ?? null;
  const canUseSimulation = aggregate?.operation.lifecycle_status === 'tracking';
  const plantMarkers = useMemo<PlantMapMarkerData[]>(
    () =>
      plants.map((plant) => {
        const isAffected = ['candidate', 'confirmed', 'manually_added'].includes(plant.reviewStatus ?? '');

        return {
          id: plant.plantId,
          isHighlighted: isAffected,
          plantId: plant.plantId,
          latitude: plant.latitude,
          longitude: plant.longitude,
          ...(isAffected
            ? {
                markerBorderColor: AFFECTED_PLANT_MARKER_COLORS.border,
                markerFillColor: AFFECTED_PLANT_MARKER_COLORS.fill,
              }
            : {}),
        };
      }),
    [plants],
  );
  const initialMapRegion = useMemo(() => createPlantMapRegion(plantMarkers, center, 0.003), [center, plantMarkers]);
  const mapDatasetKey = useMemo(
    () =>
      plantMarkers.length === 0
        ? `spraying-empty:${center?.latitude ?? 0}:${center?.longitude ?? 0}`
        : [
            'spraying-plants',
            plantMarkers.length,
            initialMapRegion.latitude,
            initialMapRegion.longitude,
            initialMapRegion.latitudeDelta,
            initialMapRegion.longitudeDelta,
          ].join(':'),
    [center?.latitude, center?.longitude, initialMapRegion, plantMarkers.length],
  );
  const plantVisualization = usePlantMapVisualization(plantMarkers, initialMapRegion, null, center !== null);

  const handleClusterPress = useCallback((cluster: PlantMapClusterVisualization) => {
    mapRef.current?.fitToCoordinates([cluster.bounds.southWest, cluster.bounds.northEast], {
      animated: true,
      edgePadding: { bottom: 70, left: 70, right: 70, top: 70 },
    });
  }, []);

  const stopSimulation = useCallback(() => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    setIsSimulationRunning(false);
  }, []);

  const clearSimulation = useCallback(() => {
    stopSimulation();
    setSimulationPoints(EMPTY_SPRAYING_SIMULATION_POINTS);
    setSelectedSimulationPointIndex(null);
    setSimulatedLocation(null);
  }, [stopSimulation]);

  useEffect(() => {
    if (!aggregate) {
      const hasPoints = simulationPoints.some(Boolean);
      if (hasPoints || isSimulationRunning || selectedSimulationPointIndex !== null || simulatedLocation !== null) {
        clearSimulation();
      }
    }
  }, [
    aggregate,
    simulationPoints,
    isSimulationRunning,
    selectedSimulationPointIndex,
    simulatedLocation,
    clearSimulation,
  ]);

  const startSimulation = useCallback(async () => {
    if (!__DEV__ || !canUseSimulation || simulationRoutePreview.length === 0) {
      return;
    }

    stopSimulation();
    if (!(await prepareRouteSimulation())) {
      return;
    }

    setIsSimulationRunning(true);

    let routeIndex = 0;
    const startedAt = Date.now();
    const emitNextLocation = () => {
      const coordinate = simulationRoutePreview[routeIndex];

      if (!coordinate) {
        stopSimulation();
        return;
      }

      const nextCoordinate = simulationRoutePreview[routeIndex + 1] ?? coordinate;
      const nextLocation = createSprayingSimulationLocation(
        coordinate,
        nextCoordinate,
        startedAt + routeIndex * SPRAYING_SIMULATION_LOCATION_INTERVAL_MS,
      );
      setSimulatedLocation(nextLocation);
      void recordSimulatedLocation(nextLocation);
      routeIndex += 1;
    };

    emitNextLocation();
    simulationIntervalRef.current = setInterval(emitNextLocation, SPRAYING_SIMULATION_LOCATION_INTERVAL_MS);
  }, [canUseSimulation, prepareRouteSimulation, recordSimulatedLocation, simulationRoutePreview, stopSimulation]);

  const handleSelectSimulationPoint = useCallback(
    (pointIndex: SprayingSimulationPointIndex) => {
      if (!canUseSimulation || isSimulationRunning) {
        return;
      }

      if (pointIndex === 0) {
        void prepareRouteSimulation();
      }

      setSelectedSimulationPointIndex(pointIndex);
    },
    [canUseSimulation, isSimulationRunning, prepareRouteSimulation],
  );

  const handleMapPress = useCallback(
    (event: { nativeEvent: { coordinate: LatLng } }) => {
      if (!__DEV__ || selectedSimulationPointIndex === null || isSimulationRunning || !canUseSimulation) {
        return;
      }

      const coordinate = event.nativeEvent.coordinate;
      setSimulationPoints((currentPoints) => {
        const nextPoints = [...currentPoints] as SprayingSimulationPoints;
        nextPoints[selectedSimulationPointIndex] = coordinate;
        return nextPoints;
      });
      setSelectedSimulationPointIndex(null);
    },
    [canUseSimulation, isSimulationRunning, selectedSimulationPointIndex],
  );

  useEffect(() => stopSimulation, [stopSimulation]);

  useEffect(() => {
    if (__DEV__ || !visibleLocation) {
      return;
    }

    mapRef.current?.animateCamera({
      center: {
        latitude: visibleLocation.coords.latitude,
        longitude: visibleLocation.coords.longitude,
      },
    });
  }, [visibleLocation]);

  if (!center) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors[theme].tint} size="large" />
        <Text style={[styles.loadingText, { color: Colors[theme].text }]}>Obtendo localização...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        key={mapDatasetKey}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        customMapStyle={theme === 'dark' ? darkMapStyle : []}
        initialRegion={initialMapRegion}
        onLongPress={handleMapPress}
        onPress={handleMapPress}
        onRegionChangeComplete={plantVisualization.onRegionChangeComplete}
        showsMyLocationButton={false}
        showsUserLocation={false}
        style={StyleSheet.absoluteFillObject}
        testID="spraying-map"
      >
        {visibleLocation ? (
          <UserMarkerLocation
            coordinate={{
              latitude: visibleLocation.coords.latitude,
              longitude: visibleLocation.coords.longitude,
            }}
            coordinateTimestamp={visibleLocation.timestamp}
            headingDegrees={visibleLocation.coords.heading ?? null}
            speedMetersPerSecond={visibleLocation.coords.speed ?? null}
          />
        ) : null}

        <PlantMapMarkers
          visualization={plantVisualization.items}
          onClusterPress={handleClusterPress}
          onPlantPress={(marker) => {
            const plant = plants.find((candidate) => candidate.plantId === marker.plantId);

            if (
              plant &&
              ['simulated', 'reviewed', 'sync_error'].includes(aggregate?.operation.lifecycle_status ?? '')
            ) {
              void togglePlant(plant);
            }
          }}
        />

        {__DEV__ && simulationRoutePreview.length >= 2 ? (
          <Polyline coordinates={simulationRoutePreview} strokeColor="#2563EB" strokeWidth={3} />
        ) : null}

        {routeCoordinates.length >= 2 ? (
          <Polyline coordinates={routeCoordinates} strokeColor="#315C2B" strokeWidth={5} />
        ) : null}

        {__DEV__
          ? simulationPoints.map((point, index) =>
              point ? (
                <Marker
                  coordinate={point}
                  identifier={`spraying-simulation-point-${index}`}
                  key={`spraying-simulation-point-${index}`}
                  pinColor={SIMULATION_POINT_MARKER_COLOR}
                  testID={`spraying-simulation-point-${index}`}
                  title={`P${index + 1}`}
                />
              ) : null,
            )
          : null}
      </MapView>

      <PlantMapDiagnostics diagnostics={plantVisualization.diagnostics} />

      <SprayingRouteSimulation
        canUseSimulation={canUseSimulation}
        isRunning={isSimulationRunning}
        onClear={clearSimulation}
        onSelectPoint={handleSelectSimulationPoint}
        onStart={() => void startSimulation()}
        onStop={stopSimulation}
        points={simulationPoints}
        selectedPointIndex={selectedSimulationPointIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
  },
  mapContainer: {
    flex: 1,
  },
});
