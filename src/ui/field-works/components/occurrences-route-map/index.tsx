import { useOccurrencesRouteStore } from '@/data/store/occurrences-route/use-occurrences-route-store';
import type { Region } from '@/domain/models/shared/geolocation.model';
import { Colors } from '@/shared/constants/theme';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { OccurrencesRequiredFilters } from '@/ui/field-works/components/occurrences-required-filters';
import { NearestPlantInRouteModalData } from '@/ui/field-works/components/nearest-plant-in-route-modal-data';
import { OccurrencesRouteActions } from '@/ui/field-works/components/occurrences-route-add-action';
import { OccurrencesRoutePlantsCircles } from '@/ui/field-works/components/occurrences-route-plants-circles';
import { UserLocationMarker } from '@/ui/shared/components/user-location-marker';
import { detectNearestPlantWithDistance, twoPointsDistance } from '@/utils/geolocation/geolocation-math';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { darkMapStyle } from '../../../../../mapStyle';

const CAMERA_ANIMATION_DURATION_MS = 500;
const CAMERA_ANIMATION_INTERVAL_MS = 350;
const MIN_LOCATION_CHANGE_METERS = 0.35;
const NEAREST_PLANT_SWITCH_MARGIN_METERS = 0.75;
const MOCK_LOCATION_UPDATE_INTERVAL_MS = 500;
const MOCK_ROUTE_STEPS_BETWEEN_POINTS = 8;

const createMockLocation = (latitude: number, longitude: number): Location.LocationObject => ({
  coords: {
    latitude,
    longitude,
    altitude: 0,
    accuracy: 1,
    altitudeAccuracy: 1,
    heading: 0,
    speed: 0,
  },
  timestamp: Date.now(),
});

const buildMockRoute = (
  start: { latitude: number; longitude: number },
  targets: { latitude: number; longitude: number }[],
): { latitude: number; longitude: number }[] => {
  const routeTargets = [start, ...targets.slice(0, 6)];

  return routeTargets.flatMap((target, targetIndex) => {
    const previousTarget = routeTargets[targetIndex - 1];

    if (!previousTarget) {
      return [target];
    }

    return Array.from({ length: MOCK_ROUTE_STEPS_BETWEEN_POINTS }, (_, stepIndex) => {
      const progress = (stepIndex + 1) / MOCK_ROUTE_STEPS_BETWEEN_POINTS;

      return {
        latitude: previousTarget.latitude + (target.latitude - previousTarget.latitude) * progress,
        longitude: previousTarget.longitude + (target.longitude - previousTarget.longitude) * progress,
      };
    });
  });
};

export const OccurrencesRouteMap = () => {
  const [showFiltersMenu, setShowFiltersMenu] = useState(false);
  const [showPlantDetails, setShowPlantDetails] = useState(false);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const { searchPlantsData, nearestPlant, setLocation, setNearestPlant } = useOccurrencesRouteStore((state) => state);
  const { setMessage, setIsVisible } = useAlertBoxStore();

  const mapRef = useRef<MapView>(null);
  const lastCameraAnimationAtRef = useRef(0);
  const lastLocationRef = useRef<Location.LocationObject | null>(null);
  const isMockingLocationRef = useRef(false);
  const mockWalkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const theme = useColorScheme() ?? 'light';

  const openNearestPlantDetails = useCallback(() => {
    if (!nearestPlant) {
      setMessage('Nenhuma planta próxima encontrada para exibir detalhes.');
      setIsVisible(true);
      return;
    }

    setShowPlantDetails(true);
  }, [nearestPlant, setIsVisible, setMessage]);

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
      setLocation(newLocation);
      animateMapToCoordinate(coordinate);
    },
    [animateMapToCoordinate, setLocation],
  );

  const stopMockWalk = useCallback(() => {
    if (mockWalkIntervalRef.current) {
      clearInterval(mockWalkIntervalRef.current);
      mockWalkIntervalRef.current = null;
    }

    isMockingLocationRef.current = false;
  }, []);

  const moveToMockCoordinate = useCallback(
    (latitude: number, longitude: number) => {
      if (!__DEV__) {
        return;
      }

      stopMockWalk();
      isMockingLocationRef.current = true;
      applyLocationUpdate(createMockLocation(latitude, longitude));
    },
    [applyLocationUpdate, stopMockWalk],
  );

  const startMockWalk = useCallback(() => {
    if (!__DEV__ || !userLocation || searchPlantsData.length === 0) {
      return;
    }

    stopMockWalk();
    isMockingLocationRef.current = true;

    const route = buildMockRoute(
      {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      },
      searchPlantsData.map((plant) => ({ latitude: plant.latitude, longitude: plant.longitude })),
    );

    let routeIndex = 0;

    mockWalkIntervalRef.current = setInterval(() => {
      const nextCoordinate = route[routeIndex];

      if (!nextCoordinate) {
        stopMockWalk();
        return;
      }

      applyLocationUpdate(createMockLocation(nextCoordinate.latitude, nextCoordinate.longitude));
      routeIndex += 1;
    }, MOCK_LOCATION_UPDATE_INTERVAL_MS);
  }, [applyLocationUpdate, searchPlantsData, stopMockWalk, userLocation]);

  useEffect(() => {
    if (!userLocation || searchPlantsData.length === 0) {
      setNearestPlant(null);
      return;
    }

    const nearestPlantDetection = detectNearestPlantWithDistance(userLocation, searchPlantsData);

    if (!nearestPlantDetection) {
      setNearestPlant(null);
      return;
    }

    if (!nearestPlant) {
      setNearestPlant(nearestPlantDetection.plant);
      return;
    }

    if (nearestPlant.id === nearestPlantDetection.plant.id) {
      if (nearestPlant !== nearestPlantDetection.plant) {
        setNearestPlant(nearestPlantDetection.plant);
      }

      return;
    }

    const currentNearestPlant = searchPlantsData.find((plant) => plant.id === nearestPlant.id);

    if (!currentNearestPlant) {
      setNearestPlant(nearestPlantDetection.plant);
      return;
    }

    const userPoint = {
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
    };
    const currentNearestDistance = twoPointsDistance(userPoint, {
      latitude: currentNearestPlant.latitude,
      longitude: currentNearestPlant.longitude,
    });

    if (currentNearestDistance - nearestPlantDetection.distance >= NEAREST_PLANT_SWITCH_MARGIN_METERS) {
      setNearestPlant(nearestPlantDetection.plant);
    }
  }, [nearestPlant, searchPlantsData, setNearestPlant, userLocation?.coords.latitude, userLocation?.coords.longitude]);

  useEffect(() => {
    let mounted = true;
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (!mounted) return;

      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      if (!mounted) return;

      const { latitude, longitude } = currentLocation.coords;

      lastLocationRef.current = currentLocation;
      setUserLocation(currentLocation);
      setLocation(currentLocation);
      setInitialRegion({
        latitude,
        longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      });

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 3,
        },
        (newLocation) => {
          if (!mounted) return;

          if (__DEV__ && isMockingLocationRef.current) {
            return;
          }

          applyLocationUpdate(newLocation);
        },
      );
    })();

    return () => {
      mounted = false;
      subscription?.remove();
      stopMockWalk();
    };
  }, [applyLocationUpdate, setLocation, stopMockWalk]);

  if (permissionDenied) {
    return (
      <View style={styles.centered}>
        <ThemedText type="defaultSemiBold">Permissão de localização negada</ThemedText>
        <ThemedText type="subtitle">
          Habilite a localização nas configurações do dispositivo para usar esta funcionalidade.
        </ThemedText>
      </View>
    );
  }

  if (!initialRegion || !userLocation) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors[theme].tint} />
        <ThemedText style={{ marginTop: 12 }} type="subtitle">
          Obtendo localização...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal
        visible={showFiltersMenu}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowFiltersMenu(false)}
      >
        {showFiltersMenu ? <OccurrencesRequiredFilters closeMenu={() => setShowFiltersMenu(false)} /> : null}
      </Modal>

      <NearestPlantInRouteModalData
        isDetailModalVisible={showPlantDetails}
        plant={nearestPlant}
        setIsDetailModalVisible={setShowPlantDetails}
      />

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          customMapStyle={theme === 'dark' ? darkMapStyle : []}
          initialRegion={initialRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          <UserLocationMarker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
          />
          {searchPlantsData?.length ? (
            <OccurrencesRoutePlantsCircles plantsData={searchPlantsData} nearestPlantId={nearestPlant?.id ?? null} />
          ) : null}
        </MapView>

        {__DEV__ ? (
          <View style={styles.mockControls}>
            <TouchableOpacity activeOpacity={0.8} style={styles.mockButtonPrimary} onPress={startMockWalk}>
              <Text style={styles.mockButtonPrimaryText}>Simular</Text>
            </TouchableOpacity>

            {searchPlantsData.slice(0, 3).map((plant, index) => (
              <TouchableOpacity
                activeOpacity={0.8}
                key={plant.id}
                style={styles.mockButton}
                onPress={() => moveToMockCoordinate(plant.latitude, plant.longitude)}
              >
                <Text style={styles.mockButtonText}>P{index + 1}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity activeOpacity={0.8} style={styles.mockButton} onPress={stopMockWalk}>
              <Text style={styles.mockButtonText}>Parar</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <View style={styles.actionsContainer}>
        <OccurrencesRouteActions
          onOpenDetails={openNearestPlantDetails}
          onOpenFilters={() => setShowFiltersMenu(true)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  actionsContainer: {
    height: 96,
    alignSelf: 'stretch',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  mockControls: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    left: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(28, 29, 28, 0.1)',
    borderRadius: 8,
    backgroundColor: 'rgba(248, 249, 248, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  mockButton: {
    minWidth: 40,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#E5E8E5',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mockButtonPrimary: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#2B4C2C',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mockButtonText: {
    color: '#1C1D1C',
    fontWeight: '600',
  },
  mockButtonPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
