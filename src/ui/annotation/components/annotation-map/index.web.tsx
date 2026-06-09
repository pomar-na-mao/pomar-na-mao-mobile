import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { useAnnotation } from '@/ui/annotation/view-models/use-annotation';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export const AnnotationMap = () => {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { currentLocation } = useAnnotation();

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#162116' : '#DDEEDD' }]}>
      <View style={[styles.mapGrid, { borderColor: colors.cardBorder }]}>
        <ThemedText type="subtitle">Mapa de anotacao</ThemedText>
        <ThemedText style={styles.text}>
          {currentLocation
            ? `${currentLocation.coords.latitude.toFixed(5)}, ${currentLocation.coords.longitude.toFixed(5)}`
            : 'Obtendo localização...'}
        </ThemedText>
        <ThemedText style={styles.text}>A planta mais proxima sera resolvida ao sincronizar.</ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  mapGrid: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    justifyContent: 'center',
    minHeight: 220,
    padding: 24,
    width: '100%',
  },
  text: {
    fontSize: 13,
  },
});
