import { useSprayingStore } from '@/data/store/spraying/use-spraying-store';
import type { Region } from '@/domain/models/shared/geolocation.model';
import { Colors } from '@/shared/constants/theme';
import { ThemedText } from '@/shared/themes/themed-text';
import { RoutinePlantsCircles } from '@/ui/routines/components/routine-plants-circles';
import { UserLocationMarker } from '@/ui/shared/components/user-location-marker';
import { useSpraying } from '@/ui/spraying/view-models/use-spraying';
import * as Location from 'expo-location';
import React, { memo, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { darkMapStyle } from '../../../../../mapStyle';

export const SprayingMap = memo(() => {
  const theme = useColorScheme() ?? 'light';
  const { plantsData } = useSpraying();
  const { liveRoutePoints } = useSprayingStore();

  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setUserLocation(current);
      setInitialRegion({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5,
        },
        (loc) => setUserLocation(loc),
      );
    })();

    return () => subscription?.remove();
  }, []);

  if (!initialRegion || !userLocation) {
    return (
      <View style={[styles.centered, { backgroundColor: Colors[theme].background }]}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
        <ThemedText style={{ marginTop: 12 }} type="subtitle">
          Obtendo localização...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={theme === 'dark' ? darkMapStyle : []}
        showsUserLocation={false}
        initialRegion={initialRegion}
      >
        {userLocation && (
          <UserLocationMarker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
          />
        )}

        {/* Plantas carregadas da região */}
        <RoutinePlantsCircles plantsData={plantsData} />

        {/* Rota do trator (Geração em tempo real) */}
        {liveRoutePoints.length > 1 && (
          <Polyline
            coordinates={liveRoutePoints}
            strokeColor={Colors[theme].tint}
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}
      </MapView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

SprayingMap.displayName = 'SprayingMap';
