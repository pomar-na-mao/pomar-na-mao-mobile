import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { InspectionNearestPlantSimulation } from '@/ui/inspection/components/inspection-nearest-plant-simulation';
import {
  buildSimulationRoute,
  createSimulationLocation,
  EMPTY_SIMULATION_POINTS,
  type InspectionSimulationPoints,
  SIMULATION_LOCATION_INTERVAL_MS,
  type SimulationPointIndex,
} from '@/ui/inspection/helpers/simulation-route';
import { useInspection } from '@/ui/inspection/view-models/use-inspection';
import { PlantMapMarkers } from '@/ui/shared/components/plant-map-markers';
import { UserMarkerLocation } from '@/ui/shared/components/user-marker-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type LatLng } from 'react-native-maps';
import { darkMapStyle } from '../../../../../mapStyle';

export const InspectionMap = () => {
  const theme = useColorScheme() ?? 'light';
  const {
    applyLocationUpdate,
    currentLocation,
    initialRegion,
    loadedPlants,
    nearestPlant,
    setLocationSimulationActive,
  } = useInspection();
  const [simulationPoints, setSimulationPoints] = useState<InspectionSimulationPoints>(EMPTY_SIMULATION_POINTS);
  const [selectedSimulationPointIndex, setSelectedSimulationPointIndex] = useState<SimulationPointIndex | null>(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const simulationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const simulationRoutePreview = useMemo(() => simulationPoints.filter(Boolean) as LatLng[], [simulationPoints]);

  const stopSimulation = useCallback(() => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    setIsSimulationRunning(false);
    setLocationSimulationActive(false);
  }, [setLocationSimulationActive]);

  const clearSimulation = useCallback(() => {
    stopSimulation();
    setSimulationPoints(EMPTY_SIMULATION_POINTS);
    setSelectedSimulationPointIndex(null);
  }, [stopSimulation]);

  const startSimulation = useCallback(() => {
    if (!__DEV__) {
      return;
    }

    const route = buildSimulationRoute(simulationPoints);

    if (route.length === 0) {
      return;
    }

    stopSimulation();
    setLocationSimulationActive(true);
    setIsSimulationRunning(true);

    let routeIndex = 0;
    const startedAt = Date.now();
    const emitNextLocation = () => {
      const coordinate = route[routeIndex];

      if (!coordinate) {
        stopSimulation();
        return;
      }

      const nextCoordinate = route[routeIndex + 1] ?? coordinate;
      applyLocationUpdate(
        createSimulationLocation(coordinate, nextCoordinate, startedAt + routeIndex * SIMULATION_LOCATION_INTERVAL_MS),
        { source: 'simulation' },
      );
      mapRef.current?.animateCamera(
        {
          center: coordinate,
        },
        { duration: SIMULATION_LOCATION_INTERVAL_MS },
      );
      routeIndex += 1;
    };

    emitNextLocation();
    simulationIntervalRef.current = setInterval(emitNextLocation, SIMULATION_LOCATION_INTERVAL_MS);
  }, [applyLocationUpdate, setLocationSimulationActive, simulationPoints, stopSimulation]);

  const handleMapPress = useCallback(
    (event: { nativeEvent: { coordinate: LatLng } }) => {
      if (!__DEV__ || selectedSimulationPointIndex === null || isSimulationRunning) {
        return;
      }

      const coordinate = event.nativeEvent.coordinate;
      setSimulationPoints((currentPoints) => {
        const nextPoints = [...currentPoints] as InspectionSimulationPoints;
        nextPoints[selectedSimulationPointIndex] = coordinate;
        return nextPoints;
      });
      setSelectedSimulationPointIndex(null);
    },
    [isSimulationRunning, selectedSimulationPointIndex],
  );

  useEffect(() => stopSimulation, [stopSimulation]);

  if (!initialRegion || !currentLocation) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
        <ThemedText style={styles.loadingText} type="subtitle">
          Obtendo localização...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        customMapStyle={theme === 'dark' ? darkMapStyle : []}
        initialRegion={{
          latitude: initialRegion.latitude,
          longitude: initialRegion.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }}
        onPress={handleMapPress}
        onLongPress={handleMapPress}
        showsMyLocationButton={false}
        showsUserLocation={false}
      >
        <UserMarkerLocation
          coordinate={{
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          }}
          coordinateTimestamp={currentLocation.timestamp}
          headingDegrees={currentLocation.coords.heading ?? null}
          speedMetersPerSecond={currentLocation.coords.speed ?? null}
        />
        <PlantMapMarkers plantsData={loadedPlants} nearestPlantId={nearestPlant?.plantId ?? null} />

        {__DEV__ && simulationRoutePreview.length >= 2 ? (
          <Polyline coordinates={simulationRoutePreview} strokeColor="#2563EB" strokeWidth={3} />
        ) : null}

        {__DEV__
          ? simulationPoints.map((point, index) =>
              point ? (
                <Marker
                  coordinate={point}
                  identifier={`inspection-simulation-point-${index}`}
                  key={`inspection-simulation-point-${index}`}
                  pinColor={index === 0 ? '#16A34A' : index === 1 ? '#F97316' : '#2563EB'}
                  title={`P${index + 1}`}
                />
              ) : null,
            )
          : null}
      </MapView>

      <InspectionNearestPlantSimulation
        isRunning={isSimulationRunning}
        onClear={clearSimulation}
        onSelectPoint={setSelectedSimulationPointIndex}
        onStart={startSimulation}
        onStop={stopSimulation}
        points={simulationPoints}
        selectedPointIndex={selectedSimulationPointIndex}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
  },
  mapContainer: {
    flex: 1,
  },
});
