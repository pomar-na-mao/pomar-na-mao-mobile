import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { InspectionNearestPlantSimulation } from '@/ui/inspection/components/inspection-nearest-plant-simulation';
import { createSimulationLocation } from '@/ui/inspection/helpers/simulation-location';
import { useInspection } from '@/ui/inspection/view-models/use-inspection';
import { PlantMapMarkers } from '@/ui/shared/components/plant-map-markers';
import { UserMarkerLocation } from '@/ui/shared/components/user-marker-location';
import React, { useCallback, useEffect, useState } from 'react';
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
        testID="inspection-map"
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
