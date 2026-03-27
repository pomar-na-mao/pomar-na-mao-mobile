import { SummaryKPIs } from '@/domain/models/report-data.model';
import { Colors } from '@/shared/constants/theme';
import { ThemedText } from '@/shared/themes/themed-text';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface SummaryCardsProps {
  summary: SummaryKPIs;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const cardBackgroundColor = useThemeColor({}, 'card');
  const labelColor = useThemeColor({}, 'icon');

  return (
    <View style={styles.container}>
      {/* Total Plants */}
      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
          <Ionicons name="leaf" size={20} color="#0284C7" />
        </View>
        <ThemedText type="defaultSemiBold" style={styles.value}>
          {summary.totalPlants}
        </ThemedText>
        <ThemedText style={[styles.label, { color: labelColor }]}>Total de Plantas</ThemedText>
      </View>

      {/* Dead Plants */}
      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <View style={[styles.iconContainer, { backgroundColor: '#FEF2F2' }]}>
          <Ionicons name="skull" size={20} color="#DC2626" />
        </View>
        <ThemedText type="defaultSemiBold" style={styles.value}>
          {summary.deadPlants}
        </ThemedText>
        <ThemedText style={[styles.label, { color: labelColor }]}>Plantas Mortas</ThemedText>
      </View>

      {/* Missing Plants (Non-existent) */}
      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <View style={[styles.iconContainer, { backgroundColor: '#FFFBEB' }]}>
          <Ionicons name="warning" size={20} color="#D97706" />
        </View>
        <ThemedText type="defaultSemiBold" style={styles.value}>
          {summary.missingPlants}
        </ThemedText>
        <ThemedText style={[styles.label, { color: labelColor }]}>Ausência (Plantas)</ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 8,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
  },
});
