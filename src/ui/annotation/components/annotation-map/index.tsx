import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { useAnnotation } from '@/ui/annotation/view-models/use-annotation';
import { UserMarkerLocation } from '@/ui/shared/components/user-marker-location';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { darkMapStyle } from '../../../../../mapStyle';

export const AnnotationMap = () => {
  const theme = useColorScheme() ?? 'light';
  const { currentLocation, initialRegion } = useAnnotation();

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
      </MapView>
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
