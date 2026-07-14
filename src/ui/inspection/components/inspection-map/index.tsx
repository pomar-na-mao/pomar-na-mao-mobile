import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { InspectionNearestPlantSimulation } from '@/ui/inspection/components/inspection-nearest-plant-simulation';
import { createSimulationLocation } from '@/ui/inspection/helpers/simulation-location';
import { useInspection } from '@/ui/inspection/view-models/use-inspection';
import { PlantMapMarkers } from '@/ui/shared/components/plant-map-markers';
import { PlantMapDiagnostics } from '@/ui/shared/components/plant-map-diagnostics';
import {
  createPlantMapRegion,
  type PlantMapClusterVisualization,
} from '@/ui/shared/components/plant-map-markers/visualization';
import { UserMarkerLocation } from '@/ui/shared/components/user-marker-location';
import { usePlantMapVisualization } from '@/ui/shared/hooks/use-plant-map-visualization';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type LatLng } from 'react-native-maps';
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
  const [simulationPoint, setSimulationPoint] = useState<LatLng | null>(null);
  const [isSelectingSimulationPoint, setIsSelectingSimulationPoint] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const mapRegion = useMemo(
    () => createPlantMapRegion(loadedPlants, initialRegion, 0.002),
    [initialRegion, loadedPlants],
  );
  const mapDatasetKey = useMemo(
    () =>
      loadedPlants.length === 0
        ? `inspection-empty:${initialRegion?.latitude ?? 0}:${initialRegion?.longitude ?? 0}`
        : [
            'inspection-plants',
            loadedPlants.length,
            mapRegion.latitude,
            mapRegion.longitude,
            mapRegion.latitudeDelta,
            mapRegion.longitudeDelta,
          ].join(':'),
    [initialRegion?.latitude, initialRegion?.longitude, loadedPlants.length, mapRegion],
  );
  const plantVisualization = usePlantMapVisualization(
    loadedPlants,
    mapRegion,
    nearestPlant?.plantId,
    initialRegion !== null,
  );

  const handleClusterPress = useCallback((cluster: PlantMapClusterVisualization) => {
    mapRef.current?.fitToCoordinates([cluster.bounds.southWest, cluster.bounds.northEast], {
      animated: true,
      edgePadding: { bottom: 70, left: 70, right: 70, top: 70 },
    });
  }, []);

  const clearSimulation = useCallback(() => {
    setLocationSimulationActive(false);
    setSimulationPoint(null);
    setIsSelectingSimulationPoint(false);
  }, [setLocationSimulationActive]);

  const handleMapPress = useCallback(
    (event: { nativeEvent: { coordinate: LatLng } }) => {
      if (!__DEV__ || !isSelectingSimulationPoint) {
        return;
      }

      const coordinate = event.nativeEvent.coordinate;
      setLocationSimulationActive(true);
      setSimulationPoint(coordinate);
      setIsSelectingSimulationPoint(false);
      applyLocationUpdate(createSimulationLocation(coordinate, Date.now()), { source: 'simulation' });
    },
    [applyLocationUpdate, isSelectingSimulationPoint, setLocationSimulationActive],
  );

  useEffect(
    () => () => {
      setLocationSimulationActive(false);
    },
    [setLocationSimulationActive],
  );

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
        key={mapDatasetKey}
        ref={mapRef}
        testID="inspection-map"
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        customMapStyle={theme === 'dark' ? darkMapStyle : []}
        initialRegion={mapRegion}
        onRegionChangeComplete={plantVisualization.onRegionChangeComplete}
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
        <PlantMapMarkers
          visualization={plantVisualization.items}
          nearestPlantId={nearestPlant?.plantId ?? null}
          onClusterPress={handleClusterPress}
        />

        {__DEV__ && simulationPoint ? (
          <Marker
            coordinate={simulationPoint}
            identifier="inspection-simulation-point"
            pinColor="#2563EB"
            testID="inspection-simulation-marker"
            title="Localização DEV"
          />
        ) : null}
      </MapView>

      <PlantMapDiagnostics diagnostics={plantVisualization.diagnostics} />

      <InspectionNearestPlantSimulation
        hasPoint={simulationPoint !== null}
        isSelectingPoint={isSelectingSimulationPoint}
        onClear={clearSimulation}
        onSelectPoint={() => setIsSelectingSimulationPoint(true)}
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
