import type { LocalSprayingOperation } from '@/domain/models/spraying';
import { Colors } from '@/shared/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const statusLabels: Record<string, string> = {
  draft: 'Configurada',
  tracking: 'Rastreando',
  finished: 'Finalizada',
  simulated: 'Em revisão',
  reviewed: 'Revisada',
  syncing: 'Sincronizando',
  synced: 'Sincronizada',
  sync_error: 'Erro no sync',
};

function formatDate(isoString?: string | null) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

const SYNCABLE_STATUSES = ['finished', 'simulated', 'reviewed', 'sync_error'];

export interface SprayingOperationCardProps {
  item: LocalSprayingOperation;
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'];
  onOpenMap: (id: string) => void;
  onSync: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}

export function SprayingOperationCard({
  item,
  colors,
  onOpenMap,
  onSync,
  onDeleteRequest,
}: SprayingOperationCardProps) {
  const statusLabel = statusLabels[item.lifecycle_status] ?? item.lifecycle_status;
  const isSynced = item.lifecycle_status === 'synced';
  const isSyncing = item.lifecycle_status === 'syncing';
  const canSync = SYNCABLE_STATUSES.includes(item.lifecycle_status);
  const isSyncDisabled = isSyncing || isSynced || !canSync;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
      testID={`spraying-item-${item.id}`}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: colors.logoBackground }]}>
          <MaterialIcons name="agriculture" color={colors.tint} size={24} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {item.title || item.zone_name}
          </Text>
          <Text style={[styles.subtitle, { color: colors.disabledText }]}>{formatDate(item.started_at)}</Text>
        </View>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isSynced
                ? 'rgba(46, 125, 50, 0.15)'
                : item.lifecycle_status === 'sync_error'
                  ? 'rgba(211, 47, 47, 0.15)'
                  : colors.activeTrackColor,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color: isSynced ? '#2E7D32' : item.lifecycle_status === 'sync_error' ? colors.danger : colors.tint,
              },
            ]}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <MaterialIcons name="person-outline" size={16} color={colors.disabledText} />
          <Text style={[styles.detailText, { color: colors.text }]}>{item.operator_name}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="precision-manufacturing" size={16} color={colors.disabledText} />
          <Text style={[styles.detailText, { color: colors.text }]}>{item.machine_name}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={[styles.metricBox, { backgroundColor: colors.background }]}>
          <Text style={[styles.metricValue, { color: colors.text }]}>{item.confirmed_plants_count ?? 0}</Text>
          <Text style={[styles.metricLabel, { color: colors.disabledText }]}>Confirmadas</Text>
        </View>
        <View style={[styles.metricBox, { backgroundColor: colors.background }]}>
          <Text style={[styles.metricValue, { color: colors.text }]}>{item.candidate_plants_count ?? 0}</Text>
          <Text style={[styles.metricLabel, { color: colors.disabledText }]}>Candidatas</Text>
        </View>
      </View>

      {item.sync_error ? (
        <Text style={[styles.errorText, { color: colors.danger }]} numberOfLines={2}>
          Erro: {item.sync_error}
        </Text>
      ) : null}

      <View style={styles.cardActions}>
        <View style={styles.leftActions}>
          <Pressable
            accessibilityLabel={`Excluir pulverização ${item.title || item.zone_name}`}
            accessibilityRole="button"
            onPress={() => onDeleteRequest(item.id)}
            style={[styles.iconBtn, { borderColor: colors.danger }]}
            testID={`delete-btn-${item.id}`}
          >
            <MaterialIcons name="delete-outline" color={colors.danger} size={20} />
          </Pressable>

          <Pressable
            accessibilityLabel="Mapa"
            accessibilityRole="button"
            onPress={() => onOpenMap(item.id)}
            style={[styles.secondaryBtn, { borderColor: colors.tint }]}
            testID={`view-map-btn-${item.id}`}
          >
            <MaterialIcons name="map" color={colors.tint} size={18} />
            <Text style={[styles.secondaryBtnText, { color: colors.tint }]}>Mapa</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityLabel={`Sincronizar pulverização ${item.title || item.zone_name}`}
          accessibilityRole="button"
          disabled={isSyncDisabled}
          onPress={() => onSync(item.id)}
          style={[
            styles.syncBtn,
            {
              backgroundColor: isSynced ? colors.cardBorder : colors.tint,
              opacity: isSyncDisabled ? 0.6 : 1,
            },
          ]}
          testID={`sync-btn-${item.id}`}
        >
          <MaterialIcons
            name={isSynced ? 'check' : 'sync'}
            color={isSynced ? colors.disabledText : '#FFFFFF'}
            size={18}
          />
          <Text style={[styles.syncBtnText, { color: isSynced ? colors.disabledText : '#FFFFFF' }]}>
            {isSynced ? 'Sincronizada' : isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
    padding: 14,
  },
  cardActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  leftActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  detailItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  errorText: {
    fontSize: 12,
  },
  headerInfo: {
    flex: 1,
  },
  iconBtn: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  metricBox: {
    borderRadius: 8,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
  },
  syncBtn: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 4,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
});
