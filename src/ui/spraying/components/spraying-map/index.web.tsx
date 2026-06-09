import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { useSpraying } from '@/ui/spraying/view-models/use-spraying';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function SprayingMap() {
  const theme = useColorScheme() ?? 'light';
  const { aggregate, selectedZone, selectedZonePlants } = useSpraying();

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].logoBackground }]}>
      <Text style={[styles.title, { color: Colors[theme].text }]}>Mapa de Pulverização</Text>
      <Text style={[styles.subtitle, { color: Colors[theme].disabledText }]}>
        {aggregate
          ? `${aggregate.plants.length} plantas carregadas, ${aggregate.trackPoints.length} pontos GPS`
          : selectedZone
            ? `${selectedZonePlants.length} plantas de ${selectedZone.name} carregadas`
            : 'Configure uma zona para carregar as plantas.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
});
