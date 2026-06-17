import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { AnnotationLocationSimulation } from '@/ui/annotation/components/annotation-location-simulation';
import { useAnnotation } from '@/ui/annotation/view-models/use-annotation';
import { createSimulationLocation } from '@/ui/inspection/helpers/simulation-location';
import { UserMarkerLocation } from '@/ui/shared/components/user-marker-location';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type LatLng } from 'react-native-maps';
import { darkMapStyle } from '../../../../../mapStyle';

export const AnnotationMap = () => {
  const theme = useColorScheme() ?? 'light';
  const { applyLocationUpdate, currentLocation, initialRegion, setLocationSimulationActive } = useAnnotation();
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
        testID="annotation-map"
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        customMapStyle={theme === 'dark' ? darkMapStyle : []}
        initialRegion={{
          latitude: initialRegion.latitude,
          longitude: initialRegion.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }}
        onLongPress={handleMapPress}
        onPress={handleMapPress}
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

        {__DEV__ && simulationPoint ? (
          <Marker
            coordinate={simulationPoint}
            identifier="annotation-simulation-point"
            pinColor="#2563EB"
            testID="annotation-simulation-marker"
            title="LocalizaÃ§Ã£o DEV"
          />
        ) : null}
      </MapView>

      <AnnotationLocationSimulation
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
