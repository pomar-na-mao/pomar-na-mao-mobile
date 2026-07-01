import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ConfirmationModal } from '@/ui/shared/components/confirmation-modal';
import { SprayingMap } from '@/ui/spraying/components/spraying-map';
import { SprayingSetupModal } from '@/ui/spraying/components/spraying-setup-modal';
import { SprayingZoneModal } from '@/ui/spraying/components/spraying-zone-modal';
import { useSpraying } from '@/ui/spraying/view-models/use-spraying';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const statusLabels = {
  draft: 'Configurada',
  tracking: 'Rastreando',
  finished: 'Finalizada',
  simulated: 'Em revisão',
  reviewed: 'Revisada',
  syncing: 'Sincronizando',
  synced: 'Sincronizada',
  sync_error: 'Erro no sync',
} as const;

export function SprayingScreen() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const {
    aggregate,
    confirmReview,
    deleteActiveOperation,
    finishTracking,
    openSetup,
    openZoneSelection,
    selectedZone,
    selectedZonePlants,
    simulate,
    startTracking,
    syncOperation,
    trackingState,
  } = useSpraying();
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  const status = aggregate?.operation.lifecycle_status;
  const hasIdleLoadedPlants = !aggregate && selectedZonePlants.length > 0;
  const canDeleteLocalSprayingState = Boolean((aggregate && status !== 'synced') || hasIdleLoadedPlants);

  const mainAction =
    !aggregate && !selectedZone
      ? { label: 'Exibir plantas', icon: 'filter-alt' as const, action: openZoneSelection }
      : !aggregate
        ? { label: 'Iniciar', icon: 'play-arrow' as const, action: openSetup }
        : status === 'draft' || (status === 'tracking' && trackingState === 'recovery_required')
          ? {
              label: trackingState === 'recovery_required' ? 'Retomar GPS' : 'Iniciar GPS',
              icon: 'play-arrow' as const,
              action: startTracking,
            }
          : status === 'tracking'
            ? { label: 'Finalizar rota', icon: 'stop' as const, action: finishTracking }
            : status === 'finished'
              ? { label: 'Simular', icon: 'route' as const, action: simulate }
              : status === 'simulated'
                ? { label: 'Confirmar revisão', icon: 'fact-check' as const, action: confirmReview }
                : status === 'reviewed' || status === 'sync_error'
                  ? { label: 'Sincronizar', icon: 'sync' as const, action: syncOperation }
                  : null;

  return (
    <View style={styles.container}>
      <SprayingMap />

      <View pointerEvents="box-none" style={styles.topPanel}>
        <View
          style={[
            styles.summary,
            {
              backgroundColor: theme === 'dark' ? 'rgba(46,49,46,0.96)' : 'rgba(255,255,255,0.96)',
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={[styles.icon, { backgroundColor: colors.logoBackground }]}>
              <MaterialIcons name="agriculture" color={colors.tint} size={22} />
            </View>
            <View style={styles.titleGroup}>
              <Text style={[styles.title, { color: colors.text }]}>Pulverização</Text>
              <Text style={[styles.subtitle, { color: colors.disabledText }]} numberOfLines={1}>
                {aggregate?.operation.zone_name ??
                  (selectedZone
                    ? `${selectedZone.name} - ${selectedZonePlants.length} plantas carregadas`
                    : 'Carregue as plantas de uma zona')}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.activeTrackColor }]}>
              <Text style={[styles.badgeText, { color: colors.tint }]}>{status ? statusLabels[status] : 'Vazio'}</Text>
            </View>
          </View>

          <View style={styles.metrics}>
            <Metric label="Pontos" value={aggregate?.summary.trackPoints ?? 0} colors={colors} />
            <Metric
              label="Rota"
              value={`${Math.round(aggregate?.summary.routeDistanceMeters ?? 0)} m`}
              colors={colors}
            />
            <Metric label="Candidatas" value={aggregate?.summary.candidatePlants ?? 0} colors={colors} />
            <Metric label="Confirmadas" value={aggregate?.summary.confirmedPlants ?? 0} colors={colors} />
          </View>

          {trackingState === 'recovery_required' ? (
            <Text style={[styles.warning, { color: colors.warning }]}>
              A operacao estava em rastreamento, mas a tarefa GPS precisa ser retomada.
            </Text>
          ) : null}

          {status === 'simulated' ? (
            <Text style={[styles.warning, { color: colors.tint }]}>
              Plantas em laranja serão sincronizadas. Toque no mapa para marcar ou desmarcar.
            </Text>
          ) : null}
        </View>
      </View>

      {mainAction || canDeleteLocalSprayingState ? (
        <View pointerEvents="box-none" style={styles.bottomPanel}>
          <View testID="spraying-action-bar" style={styles.actionBar}>
            {canDeleteLocalSprayingState ? (
              <Pressable
                accessibilityLabel="Excluir estado local de pulverização"
                accessibilityRole="button"
                onPress={() => setIsDeleteConfirmationVisible(true)}
                style={[styles.iconButton, { backgroundColor: colors.background, borderColor: colors.danger }]}
              >
                <MaterialIcons name="delete-outline" color={colors.danger} size={24} />
              </Pressable>
            ) : null}

            {mainAction ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => void mainAction.action()}
                style={[styles.primaryButton, { backgroundColor: colors.tint }]}
              >
                <MaterialIcons name={mainAction.icon} color="#FFFFFF" size={20} />
                <Text style={styles.primaryButtonText}>{mainAction.label}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      <ConfirmationModal
        visible={isDeleteConfirmationVisible}
        title="Excluir Pulverização"
        message={
          aggregate
            ? 'Deseja apagar a operacao ativa e todos os pontos, rota, insumos e revisoes locais?'
            : 'Deseja remover as plantas carregadas desta Pulverização?'
        }
        onCancel={() => setIsDeleteConfirmationVisible(false)}
        onConfirm={() => {
          setIsDeleteConfirmationVisible(false);
          void deleteActiveOperation();
        }}
      />

      <SprayingSetupModal />
      <SprayingZoneModal />
    </View>
  );
}

function Metric({
  label,
  value,
  colors,
}: {
  label: string;
  value: string | number;
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'];
}) {
  return (
    <View style={[styles.metric, { backgroundColor: colors.background }]}>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.disabledText }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actionBar: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    padding: 10,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  icon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
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
  metric: {
    borderRadius: 10,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  metrics: {
    flexDirection: 'row',
    gap: 6,
  },
  subtitle: {
    fontSize: 12,
  },
  summary: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
  },
  titleGroup: {
    flex: 1,
  },
  topPanel: {
    left: 12,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  warning: {
    fontSize: 12,
    fontWeight: '700',
  },
});
