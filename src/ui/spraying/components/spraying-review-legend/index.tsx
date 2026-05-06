import { Colors } from '@/shared/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

interface SprayingReviewLegendProps {
  preSelectedCount: number;
  finalCount: number;
}

export const SprayingReviewLegend = memo(({ preSelectedCount, finalCount }: SprayingReviewLegendProps) => {
  const theme = useColorScheme() ?? 'light';
  const bg = theme === 'dark' ? 'rgba(28,29,28,0.94)' : 'rgba(255,255,255,0.94)';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.row}>
        <MaterialIcons name="info-outline" size={15} color={Colors[theme].tint} style={{ marginRight: 4 }} />
        <Text style={[styles.title, { color: Colors[theme].text }]}>Modo Revisão</Text>
      </View>

      <View style={styles.legendRow}>
        <View style={[styles.dot, { backgroundColor: '#F97316' }]} />
        <Text style={[styles.label, { color: Colors[theme].text }]}>Auto-selecionada ({preSelectedCount})</Text>
      </View>

      <View style={styles.legendRow}>
        <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
        <Text style={[styles.label, { color: Colors[theme].text }]}>Adicionada manualmente</Text>
      </View>

      <View style={styles.legendRow}>
        <View style={[styles.dot, { backgroundColor: '#6B7280' }]} />
        <Text style={[styles.label, { color: Colors[theme].text }]}>Removida manualmente</Text>
      </View>

      <Text style={[styles.total, { color: Colors[theme].tint }]}>Total a sincronizar: {finalCount}</Text>
    </View>
  );
});

SprayingReviewLegend.displayName = 'SprayingReviewLegend';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 12,
  },
  total: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
});
