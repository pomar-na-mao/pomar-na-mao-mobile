import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { FieldWorkHeader } from '@/ui/shared/components/field-work-header';
import { InspectionFilterModal } from '@/ui/inspection/components/inspection-filter-modal';
import { InspectionMap } from '@/ui/inspection/components/inspection-map';
import { NearestPlantModal } from '@/ui/inspection/components/nearest-plant-modal';
import { useInspection } from '@/ui/inspection/view-models/use-inspection';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const InspectionScreen = () => {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const {
    activeInspection,
    loadedPlants,
    nearestPlant,
    openFilterModal,
    openNearestPlantModal,
    finishActiveInspection,
    syncInspection,
  } = useInspection();

  const nearestShortId = nearestPlant?.plantId.slice(0, 8);
  const distanceLabel = nearestPlant?.distanceMeters ? `${nearestPlant.distanceMeters.toFixed(1)} m` : '-';
  const canFinish = activeInspection?.status === 'in_progress';
  const canSync = activeInspection?.status === 'finished' && activeInspection.sync_status !== 'synced';
  const isSynced = activeInspection?.sync_status === 'synced';
  const statusLabel = isSynced ? 'Sincronizada' : canSync ? 'Finalizada' : activeInspection ? 'Em campo' : 'Vazio';
  const activeFilterLabel = activeInspection
    ? [activeInspection.zone_name ?? 'Todas as zonas', activeInspection.occurrence_name ?? 'Todas as ocorrÃªncias'].join(
        ' â€¢ ',
      )
    : 'Aplique um filtro para carregar plantas.';

  return (
    <View style={styles.container}>
      <FieldWorkHeader
        backAccessibilityLabel="Voltar para trabalhos de campo"
        onBackPress={() => router.back()}
        title="Inspecao"
      />

      <View style={styles.content}>
        <InspectionMap />

        <View
          pointerEvents="box-none"
          style={[styles.topPanel, __DEV__ && styles.topPanelWithDiagnostics]}
          testID="inspection-summary-panel"
        >
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
                <MaterialIcons name="fact-check" size={20} color={colors.tint} />
              </View>
              <View style={styles.summaryTitleGroup}>
                <Text style={[styles.summaryTitle, { color: colors.text }]}>InspeÃ§Ã£o</Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[styles.summarySubtitle, { color: colors.disabledText }]}
                >
                  {activeFilterLabel}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: activeInspection ? colors.activeTrackColor : colors.neutralButtonBackground },
                ]}
              >
                <Text style={[styles.statusBadgeText, { color: activeInspection ? colors.tint : colors.disabledText }]}>
                  {statusLabel}
                </Text>
              </View>
            </View>

            <View style={styles.summaryMetrics}>
              <View style={[styles.metricChip, { backgroundColor: theme === 'dark' ? '#243B2A' : '#E8F3E8' }]}>
                <Text style={[styles.metricValue, { color: colors.text }]}>{loadedPlants.length}</Text>
                <Text style={[styles.metricLabel, { color: colors.disabledText }]}>carregadas</Text>
              </View>
              <View style={[styles.metricChip, { backgroundColor: theme === 'dark' ? '#263B46' : '#E7F1F8' }]}>
                <Text style={[styles.metricValue, { color: colors.text }]}>
                  {activeInspection?.plants_changed_count ?? 0}
                </Text>
                <Text style={[styles.metricLabel, { color: colors.disabledText }]}>alteradas</Text>
              </View>
              <View
                style={[
                  styles.metricChip,
                  styles.nearestChip,
                  { backgroundColor: theme === 'dark' ? '#4A2424' : '#FDECEC' },
                ]}
              >
                <Text numberOfLines={1} style={[styles.metricValue, { color: colors.danger }]}>
                  {nearestShortId ?? '--'}
                </Text>
                <Text style={[styles.metricLabel, { color: colors.disabledText }]}>prÃ³xima â€¢ {distanceLabel}</Text>
              </View>
            </View>
          </View>
        </View>

        <View pointerEvents="box-none" style={styles.bottomPanel}>
          <View
            style={[
              styles.actionBar,
              {
                backgroundColor: theme === 'dark' ? 'rgba(28, 29, 28, 0.94)' : 'rgba(255, 255, 255, 0.94)',
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir detalhes da planta prÃ³xima"
              style={[styles.iconButton, { backgroundColor: colors.background, borderColor: colors.line }]}
              onPress={openNearestPlantModal}
            >
              <MaterialIcons name="info-outline" size={24} color={colors.text} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir filtro de inspeÃ§Ã£o"
              style={[styles.primaryButton, { backgroundColor: colors.tint }]}
              onPress={openFilterModal}
            >
              <MaterialIcons name="filter-alt" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Exibir plantas</Text>
            </Pressable>

            {canSync || isSynced ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sincronizar inspeÃ§Ã£o"
                disabled={!canSync}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: colors.confirmationButtonBackground,
                    opacity: canSync ? 1 : 0.55,
                  },
                ]}
                onPress={() => {
                  if (activeInspection) {
                    syncInspection(activeInspection.id);
                  }
                }}
              >
                <MaterialIcons name={isSynced ? 'cloud-done' : 'sync'} size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>{isSynced ? 'Sincronizada' : 'Sincronizar'}</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Finalizar inspeÃ§Ã£o"
                disabled={!canFinish}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: colors.secondary,
                    opacity: canFinish ? 1 : 0.55,
                  },
                ]}
                onPress={finishActiveInspection}
              >
                <MaterialIcons name="check" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Finalizar</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <InspectionFilterModal />
      <NearestPlantModal />
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
    borderWidth: 1,
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
  nearestChip: {
    flex: 1.25,
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
    fontWeight: '700',
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
  topPanelWithDiagnostics: {
    top: 44,
  },
});
