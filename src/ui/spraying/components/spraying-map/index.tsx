import { useSprayingStore } from '@/data/store/spraying/use-spraying-store';
import type { Region } from '@/domain/models/shared/geolocation.model';
import { Colors } from '@/shared/constants/theme';
import { ThemedText } from '@/shared/themes/themed-text';
import { RoutinePlantsCircles } from '@/ui/routines/components/routine-plants-circles';
import { SprayingReviewPlants } from '@/ui/spraying/components/spraying-review-plants';
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
  const { plantsData, isReviewMode, reviewPreviewIds, reviewOverrides, handleToggleReviewPlant } = useSpraying();
  const { liveRoutePoints, activeSession } = useSprayingStore();

  /** Ref to latest plantsData for use inside the press callback without stale closure */
  const plantsDataRef = useRef(plantsData);
  plantsDataRef.current = plantsData;
  const isReviewModeRef = useRef(isReviewMode);
  isReviewModeRef.current = isReviewMode;
  const handleToggleReviewPlantRef = useRef(handleToggleReviewPlant);
  handleToggleReviewPlantRef.current = handleToggleReviewPlant;

  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [mockRouteStart, setMockRouteStart] = useState<MockRouteCoordinate | null>(null);
  const [mockRouteEnd, setMockRouteEnd] = useState<MockRouteCoordinate | null>(null);
  const [mockRouteSelectionMode, setMockRouteSelectionMode] = useState<MockRouteSelectionMode>(null);

  // Quando a sessão é removida (delete), limpa os pontos A e B da simulação
  useEffect(() => {
    if (!activeSession) {
      setMockRouteStart(null);
      setMockRouteEnd(null);
      setMockRouteSelectionMode(null);
    }
  }, [activeSession]);

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

      // During review mode the user is manually navigating the map to tap plants,
      // so we skip the camera follow to avoid interrupting their zoom/pan.
      if (!isReviewModeRef.current) {
        animateMapToCoordinate(coordinate);
      }
    },
    [animateMapToCoordinate],
  );

  /**
   * Tap radius in meters for plant selection in review mode.
   * Larger than the GPS association radius so it's easy to tap.
   */
  const REVIEW_TAP_RADIUS_METERS = 15;

  const handleMapPress = useCallback(
    (event: MapPressEvent) => {
      const coordinate = event.nativeEvent.coordinate;

      // ── Review mode: find nearest plant within tap radius ──
      if (isReviewModeRef.current) {
        const plants = plantsDataRef.current;
        let nearestId: string | null = null;
        let nearestDist = Infinity;

        for (const plant of plants) {
          if (plant.latitude == null || plant.longitude == null) continue;
          const dist = twoPointsDistance(
            { latitude: coordinate.latitude, longitude: coordinate.longitude },
            { latitude: plant.latitude, longitude: plant.longitude },
          );
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestId = plant.id;
          }
        }

        if (nearestId !== null && nearestDist <= REVIEW_TAP_RADIUS_METERS) {
          handleToggleReviewPlantRef.current(nearestId);
        }
        return;
      }

      // ── Dev mode: mock route selection ──
      if (!__DEV__ || !mockRouteSelectionMode) {
        return;
      }

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
        {isReviewMode ? (
          <SprayingReviewPlants
            key="review-overlay"
            plantsData={plantsData}
            reviewPreviewIds={reviewPreviewIds}
            reviewOverrides={reviewOverrides}
          />
        ) : (
          <RoutinePlantsCircles key="normal-overlay" plantsData={plantsData} />
        )}

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
