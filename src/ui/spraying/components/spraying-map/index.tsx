import { useSprayingStore } from '@/data/store/spraying/use-spraying-store';
import type { Region } from '@/domain/models/shared/geolocation.model';
import { Colors } from '@/shared/constants/theme';
import { ThemedText } from '@/shared/themes/themed-text';
import { RoutinePlantsCircles } from '@/ui/routines/components/routine-plants-circles';
import {
  type MockRouteCoordinate,
  type MockRouteSelectionMode,
  SprayingRouteSimulation,
} from '@/ui/spraying/components/spraying-route-simulation';
import { useSpraying } from '@/ui/spraying/view-models/use-spraying';
import { twoPointsDistance } from '@/utils/geolocation/geolocation-math';
import * as Location from 'expo-location';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';
import MapView, { type MapPressEvent, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { darkMapStyle } from '../../../../../mapStyle';

const CAMERA_ANIMATION_DURATION_MS = 500;
const CAMERA_ANIMATION_INTERVAL_MS = 350;
const MIN_LOCATION_CHANGE_METERS = 0.35;
const ROUTE_STROKE_COLOR = {
  dark: '#3b82f6',
  light: '#1d4ed8',
};

export const SprayingMap = memo(() => {
  const theme = useColorScheme() ?? 'light';
  const { plantsData } = useSpraying();
  const { liveRoutePoints } = useSprayingStore();

  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [mockRouteStart, setMockRouteStart] = useState<MockRouteCoordinate | null>(null);
  const [mockRouteEnd, setMockRouteEnd] = useState<MockRouteCoordinate | null>(null);
  const [mockRouteSelectionMode, setMockRouteSelectionMode] = useState<MockRouteSelectionMode>(null);

  const mapRef = useRef<MapView>(null);
  const lastCameraAnimationAtRef = useRef(0);
  const lastLocationRef = useRef<Location.LocationObject | null>(null);

  const animateMapToCoordinate = useCallback((coordinate: { latitude: number; longitude: number }) => {
    const now = Date.now();

    if (now - lastCameraAnimationAtRef.current < CAMERA_ANIMATION_INTERVAL_MS) {
      return;
    }

    lastCameraAnimationAtRef.current = now;
    mapRef.current?.animateCamera({ center: coordinate }, { duration: CAMERA_ANIMATION_DURATION_MS });
  }, []);

  const applyLocationUpdate = useCallback(
    (newLocation: Location.LocationObject) => {
      const coordinate = {
        latitude: newLocation.coords.latitude,
        longitude: newLocation.coords.longitude,
      };

      if (lastLocationRef.current) {
        const previousCoordinate = {
          latitude: lastLocationRef.current.coords.latitude,
          longitude: lastLocationRef.current.coords.longitude,
        };
        const movedDistance = twoPointsDistance(previousCoordinate, coordinate);

        if (movedDistance < MIN_LOCATION_CHANGE_METERS) {
          return;
        }
      }

      lastLocationRef.current = newLocation;
      setUserLocation(newLocation);
      animateMapToCoordinate(coordinate);
    },
    [animateMapToCoordinate],
  );

  const handleMapPress = useCallback(
    (event: MapPressEvent) => {
      if (!__DEV__ || !mockRouteSelectionMode) {
        return;
      }

      const coordinate = event.nativeEvent.coordinate;

      if (mockRouteSelectionMode === 'start') {
        setMockRouteStart(coordinate);
      } else {
        setMockRouteEnd(coordinate);
      }

      setMockRouteSelectionMode(null);
    },
    [mockRouteSelectionMode],
  );

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      lastLocationRef.current = current;
      setUserLocation(current);
      setInitialRegion({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 1,
          timeInterval: 1_000,
        },
        (loc) => {
          if (__DEV__ && useSprayingStore.getState().isMockingLocation) {
            return;
          }

          applyLocationUpdate(loc);
        },
      );
    })();

    return () => subscription?.remove();
  }, [applyLocationUpdate]);

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
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={theme === 'dark' ? darkMapStyle : []}
        showsUserLocation={false}
        initialRegion={initialRegion}
        onPress={handleMapPress}
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            anchor={{ x: 0.5, y: 1 }}
            zIndex={99}
          />
        )}

        {/* Plantas carregadas da região */}
        <RoutinePlantsCircles plantsData={plantsData} />

        {__DEV__ && mockRouteStart ? (
          <Marker coordinate={mockRouteStart} anchor={{ x: 0.5, y: 1 }} pinColor="#16A34A" zIndex={101} title="A" />
        ) : null}

        {__DEV__ && mockRouteEnd ? (
          <Marker coordinate={mockRouteEnd} anchor={{ x: 0.5, y: 1 }} pinColor="#2563EB" zIndex={101} title="B" />
        ) : null}

        {__DEV__ && mockRouteStart && mockRouteEnd ? (
          <Polyline
            coordinates={[mockRouteStart, mockRouteEnd]}
            strokeColor={theme === 'dark' ? '#FACC15' : '#CA8A04'}
            strokeWidth={3}
            lineDashPattern={[8, 8]}
            zIndex={98}
          />
        ) : null}

        {/* Rota do trator (Geração em tempo real) */}
        {liveRoutePoints.length > 1 && (
          <Polyline
            coordinates={liveRoutePoints}
            strokeColor={ROUTE_STROKE_COLOR[theme]}
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}
      </MapView>

      <View style={styles.simulationContainer}>
        <SprayingRouteSimulation
          applyLocationUpdate={applyLocationUpdate}
          endCoordinate={mockRouteEnd}
          onSelectionModeChange={setMockRouteSelectionMode}
          selectionMode={mockRouteSelectionMode}
          startCoordinate={mockRouteStart}
        />
      </View>
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
  simulationContainer: {
    alignItems: 'center',
    bottom: 104,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 100,
  },
});

SprayingMap.displayName = 'SprayingMap';
