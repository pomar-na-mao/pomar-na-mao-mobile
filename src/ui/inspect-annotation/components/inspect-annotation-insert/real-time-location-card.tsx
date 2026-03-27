import { Colors } from '@/shared/constants/theme';
import { ThemedText } from '@/shared/themes/themed-text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, useColorScheme } from 'react-native';

export const RealTimeLocationCard = () => {
  const theme = useColorScheme() ?? 'light';

  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') return;

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      setLocation(currentLocation);

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 1,
        },
        (newLocation) => {
          setLocation(newLocation);
        },
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <View
      style={[
        styles.locationCard,
        {
          backgroundColor: Colors[theme].card,
          borderColor: Colors[theme].cardBorder,
        },
      ]}
    >
      <View style={[styles.locationIconContainer, { backgroundColor: Colors[theme].iconBackground }]}>
        <MaterialCommunityIcons name="map-marker-radius" size={28} color={Colors[theme].tint} />
      </View>

      <View style={styles.locationContent}>
        <ThemedText style={styles.locationTitle}>Localização Atual</ThemedText>

        {location ? (
          <View style={styles.coordinatesContainer}>
            <View style={styles.coordinateRow}>
              <ThemedText style={[styles.coordinateLabel, { color: Colors[theme].icon }]}>Lat</ThemedText>
              <ThemedText style={[styles.coordinateValue, { color: Colors[theme].tint }]}>
                {location.coords.latitude.toFixed(6)}°
              </ThemedText>
            </View>
            <View style={[styles.coordinateDivider, { backgroundColor: Colors[theme].line }]} />
            <View style={styles.coordinateRow}>
              <ThemedText style={[styles.coordinateLabel, { color: Colors[theme].icon }]}>Lng</ThemedText>
              <ThemedText style={[styles.coordinateValue, { color: Colors[theme].tint }]}>
                {location.coords.longitude.toFixed(6)}°
              </ThemedText>
            </View>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors[theme].tint} />
            <ThemedText style={[styles.loadingText, { color: Colors[theme].icon }]}>Obtendo localização...</ThemedText>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  locationIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationContent: {
    flex: 1,
    gap: 8,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coordinateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coordinateLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coordinateValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  coordinateDivider: {
    width: 1,
    height: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
});
