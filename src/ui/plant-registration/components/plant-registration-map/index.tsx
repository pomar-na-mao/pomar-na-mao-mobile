import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { UserMarkerLocation } from '@/ui/shared/components/user-marker-location';
import type { LocationObject } from 'expo-location';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { darkMapStyle } from '../../../../../mapStyle';

export function PlantRegistrationMap({ location }: { location: LocationObject }) {
  const theme = useColorScheme() ?? 'light';
  const coordinate = { latitude: location.coords.latitude, longitude: location.coords.longitude };

  return (
    <View
      accessible
      // eslint-disable-next-line max-len
      accessibilityLabel={`Mapa da posição atual, latitude ${coordinate.latitude.toFixed(6)}, longitude ${coordinate.longitude.toFixed(6)}`}
      style={[styles.container, { borderColor: Colors[theme].cardBorder }]}
    >
      <MapView
        customMapStyle={theme === 'dark' ? darkMapStyle : []}
        initialRegion={{ ...coordinate, latitudeDelta: 0.002, longitudeDelta: 0.002 }}
        provider={PROVIDER_GOOGLE}
        showsMyLocationButton={false}
        showsUserLocation={false}
        style={StyleSheet.absoluteFillObject}
        testID="plant-registration-map"
      >
        <UserMarkerLocation
          coordinate={coordinate}
          coordinateTimestamp={location.timestamp}
          headingDegrees={location.coords.heading ?? null}
          speedMetersPerSecond={location.coords.speed ?? null}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    height: 220,
    overflow: 'hidden',
    width: '100%',
  },
});
