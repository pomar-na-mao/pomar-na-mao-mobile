import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import type { LocationObject } from 'expo-location';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function PlantRegistrationMap({ location }: { location: LocationObject }) {
  const theme = useColorScheme() ?? 'light';
  return (
    <View
      accessibilityLabel="Prévia da posição atual"
      style={[styles.container, { backgroundColor: Colors[theme].logoBackground }]}
      testID="plant-registration-map"
    >
      <Text style={[styles.title, { color: Colors[theme].text }]}>Posição atual</Text>
      <Text style={{ color: Colors[theme].disabledText }}>
        {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', height: 220, justifyContent: 'center', width: '100%' },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
});
