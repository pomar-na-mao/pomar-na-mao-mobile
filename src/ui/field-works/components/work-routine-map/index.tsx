import { useWorkRoutineStore } from '@/data/store/work-routine/use-work-routine-store';
import type { Region } from '@/domain/models/shared/geolocation.model';
import { Colors } from '@/shared/constants/theme';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { NearestPlantInWorkRoutineModalData } from '@/ui/field-works/components/nearest-plant-in-work-routine-modal-data';
import { WorkRoutineActions } from '@/ui/field-works/components/work-routine-actions';
import { WorkRoutinePlantsCircles } from '@/ui/field-works/components/work-routine-plants-circles';
import { WorkRoutineRequiredFilters } from '@/ui/field-works/components/work-routine-required-filters';
import { WorkRoutineRouteSimulation } from '@/ui/field-works/components/work-routine-route-simulation';
import { UserLocationMarker } from '@/ui/shared/components/user-location-marker';
import { detectNearestPlantWithDistance, twoPointsDistance } from '@/utils/geolocation/geolocation-math';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { darkMapStyle } from '../../../../../mapStyle';
import { styles } from './style';

const CAMERA_ANIMATION_DURATION_MS = 500;
const CAMERA_ANIMATION_INTERVAL_MS = 350;
const MIN_LOCATION_CHANGE_METERS = 0.35;
const NEAREST_PLANT_SWITCH_MARGIN_METERS = 0.75;
const ROUTE_EDGE_PADDING = { top: 80, right: 80, bottom: 120, left: 80 };
const ROUTE_STROKE_WIDTH = 5;
const ROUTE_OUTLINE_WIDTH = 9;

export const WorkRoutineMap = () => {
  const [showFiltersMenu, setShowFiltersMenu] = useState(false);
  const [showPlantDetails, setShowPlantDetails] = useState(false);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const { searchPlantsData, nearestPlant, setLocation, setNearestPlant } = useWorkRoutineStore((state) => state);
  const { setMessage, setIsVisible } = useAlertBoxStore();

  const mapRef = useRef<MapView>(null);
  const lastCameraAnimationAtRef = useRef(0);
  const lastLocationRef = useRef<Location.LocationObject | null>(null);
  const lastFittedNearestPlantIdRef = useRef<string | null>(null);
  const isMockingLocationRef = useRef(false);
  const theme = useColorScheme() ?? 'light';

  const routeLineCoordinates = useMemo(() => {
    if (!userLocation || !nearestPlant) {
      return null;
    }

    return [
      {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      },
      {
        latitude: nearestPlant.latitude,
        longitude: nearestPlant.longitude,
      },
    ];
  }, [nearestPlant, userLocation?.coords.latitude, userLocation?.coords.longitude]);

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

  useEffect(() => {
    if (showFiltersMenu || showPlantDetails) {
      return;
    }

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
  }, [
    nearestPlant,
    searchPlantsData,
    setNearestPlant,
    userLocation?.coords.latitude,
    userLocation?.coords.longitude,
    showFiltersMenu,
    showPlantDetails,
  ]);

  useEffect(() => {
    if (!routeLineCoordinates || !nearestPlant || lastFittedNearestPlantIdRef.current === nearestPlant.id) {
      return;
    }

    lastFittedNearestPlantIdRef.current = nearestPlant.id;
    mapRef.current?.fitToCoordinates(routeLineCoordinates, {
      edgePadding: ROUTE_EDGE_PADDING,
      animated: true,
    });
  }, [nearestPlant, routeLineCoordinates]);

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
    };
  }, [applyLocationUpdate, setLocation]);

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
        {showFiltersMenu ? <WorkRoutineRequiredFilters closeMenu={() => setShowFiltersMenu(false)} /> : null}
      </Modal>

      <NearestPlantInWorkRoutineModalData
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
          {routeLineCoordinates ? (
            <>
              <Polyline
                coordinates={routeLineCoordinates}
                strokeColor={theme === 'dark' ? 'rgba(28, 29, 28, 0.82)' : 'rgba(255, 255, 255, 0.9)'}
                strokeWidth={ROUTE_OUTLINE_WIDTH}
                lineCap="round"
                lineJoin="round"
                geodesic
                zIndex={96}
              />
              <Polyline
                coordinates={routeLineCoordinates}
                strokeColor={Colors[theme].secondary}
                strokeWidth={ROUTE_STROKE_WIDTH}
                lineCap="round"
                lineJoin="round"
                geodesic
                zIndex={97}
              />
            </>
          ) : null}
          {searchPlantsData?.length ? (
            <WorkRoutinePlantsCircles plantsData={searchPlantsData} nearestPlantId={nearestPlant?.id ?? null} />
          ) : null}
        </MapView>

        <WorkRoutineRouteSimulation
          applyLocationUpdate={applyLocationUpdate}
          onMockingLocationChange={(isMockingLocation) => {
            isMockingLocationRef.current = isMockingLocation;
          }}
          plantsData={searchPlantsData}
          userLocation={userLocation}
        />
      </View>

      <View style={styles.actionsContainer}>
        <WorkRoutineActions onOpenDetails={openNearestPlantDetails} onOpenFilters={() => setShowFiltersMenu(true)} />
      </View>
    </View>
  );
};
