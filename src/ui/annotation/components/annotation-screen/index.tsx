import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { AnnotationDataModal } from '@/ui/annotation/components/annotation-data-modal';
import { AnnotationMap } from '@/ui/annotation/components/annotation-map';
import { useAnnotation } from '@/ui/annotation/view-models/use-annotation';
import { FieldWorkHeader } from '@/ui/shared/components/field-work-header';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const AnnotationScreen = () => {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const {
    activeOperation,
    annotations,
    clearAnnotations,
    finishActiveAnnotationOperation,
    openAnnotationModal,
    summary,
    syncAnnotations,
  } = useAnnotation();
  const statusLabel = activeOperation?.finished_at ? 'Finalizada' : activeOperation ? 'Em campo' : 'Vazio';
  const hasAnnotations = annotations.length > 0;

  return (
    <View style={styles.container}>
      <FieldWorkHeader
        backAccessibilityLabel="Voltar para trabalhos de campo"
        onBackPress={() => router.back()}
        title="Anotação"
      />

      <View style={styles.content}>
        <AnnotationMap />

        <View pointerEvents="box-none" style={styles.topPanel}>
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme === 'dark' ? 'rgba(46, 49, 46, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.summaryHeader}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.logoBackground }]}>
                <MaterialIcons name="edit-location-alt" size={20} color={colors.tint} />
              </View>
              <View style={styles.summaryTitleGroup}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>Anotação</Text>
                <Text numberOfLines={1} style={[styles.summarySubtitle, { color: colors.disabledText }]}>
                  Registre ocorrências
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: activeOperation ? colors.activeTrackColor : colors.neutralButtonBackground },
                ]}
              >
                <Text style={[styles.statusBadgeText, { color: activeOperation ? colors.tint : colors.disabledText }]}>
                  {statusLabel}
                </Text>
              </View>
            </View>

            <View style={styles.summaryMetrics}>
              <View style={[styles.metricChip, { backgroundColor: theme === 'dark' ? '#243B2A' : '#E8F3E8' }]}>
                <Text style={[styles.metricValue, { color: colors.text }]}>{summary.total}</Text>
                <Text style={[styles.metricLabel, { color: colors.disabledText }]}>Total</Text>
              </View>
              <View style={[styles.metricChip, { backgroundColor: theme === 'dark' ? '#263B46' : '#E7F1F8' }]}>
                <Text style={[styles.metricValue, { color: colors.text }]}>{summary.pending}</Text>
                <Text style={[styles.metricLabel, { color: colors.disabledText }]}>Pendentes</Text>
              </View>
              <View style={[styles.metricChip, { backgroundColor: theme === 'dark' ? '#4A2424' : '#FDECEC' }]}>
                <Text style={[styles.metricValue, { color: colors.text }]}>{summary.error}</Text>
                <Text style={[styles.metricLabel, { color: colors.disabledText }]}>Erros</Text>
              </View>
            </View>
          </View>
        </View>

        <View pointerEvents="box-none" style={styles.bottomPanel}>
          <View
            style={[
              styles.actionBar,
              { backgroundColor: theme === 'dark' ? 'rgba(28, 29, 28, 0.94)' : 'rgba(255, 255, 255, 0.94)' },
            ]}
          >
            <Pressable
              accessibilityLabel="Abrir dados da anotação"
              accessibilityRole="button"
              onPress={openAnnotationModal}
              style={[styles.primaryButton, { backgroundColor: colors.tint }]}
            >
              <MaterialIcons name="add-location-alt" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Marcar</Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Finalizar anotação"
              accessibilityRole="button"
              disabled={!activeOperation}
              onPress={finishActiveAnnotationOperation}
              style={[styles.primaryButton, { backgroundColor: colors.secondary, opacity: activeOperation ? 1 : 0.55 }]}
            >
              <MaterialIcons name="check" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Finalizar</Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Sincronizar anotacoes"
              accessibilityRole="button"
              disabled={summary.pending + summary.error === 0}
              onPress={syncAnnotations}
              style={[
                styles.iconButton,
                {
                  backgroundColor: colors.confirmationButtonBackground,
                  opacity: summary.pending + summary.error > 0 ? 1 : 0.55,
                },
              ]}
            >
              <MaterialIcons name="sync" size={22} color="#FFFFFF" />
            </Pressable>

            <Pressable
              accessibilityLabel="Apagar anotacoes"
              accessibilityRole="button"
              disabled={!hasAnnotations}
              onPress={clearAnnotations}
              style={[
                styles.iconButton,
                {
                  backgroundColor: colors.destructiveButtonBackground,
                  opacity: hasAnnotations ? 1 : 0.55,
                },
              ]}
            >
              <MaterialIcons name="delete-outline" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>

      <AnnotationDataModal />
    </View>
  );
};

const styles = StyleSheet.create({
  actionBar: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    padding: 10,
  },
  bottomPanel: {
    bottom: 20,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 30,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  metricChip: {
    borderRadius: 8,
    flex: 1,
    gap: 2,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: 999,
    flexShrink: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  summaryCard: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  summaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  summaryIcon: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  summaryMetrics: {
    flexDirection: 'row',
    gap: 8,
  },
  summarySubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  summaryTitleGroup: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  topPanel: {
    left: 12,
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 20,
  },
});
