import type { LocalPlantRegistration } from '@/domain/models/plant-registration';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

interface PlantRegistrationCardProps {
  isOnline: boolean;
  plant: LocalPlantRegistration;
  onDelete: (plant: LocalPlantRegistration) => void;
  onSync: (id: string) => void;
}

const statusLabels = {
  pending_create: 'Pendente',
  syncing: 'Sincronizando',
  synced: 'Sincronizada',
  error: 'Erro ao sincronizar',
} as const;

export function PlantRegistrationCard({ isOnline, plant, onDelete, onSync }: PlantRegistrationCardProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const canSync = isOnline && (plant.sync_status === 'pending_create' || plant.sync_status === 'error');
  const [isDeletePressed, setDeletePressed] = useState(false);
  const [isSyncPressed, setSyncPressed] = useState(false);

  const requestDelete = (swipeable?: SwipeableMethods) => {
    swipeable?.close();
    onDelete(plant);
  };
  const requestSync = (swipeable?: SwipeableMethods) => {
    swipeable?.close();
    if (canSync) onSync(plant.id);
  };

  const card = (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: colors.logoBackground }]}>
          <MaterialIcons color={colors.tint} name="eco" size={22} />
        </View>
        <View style={styles.titleGroup}>
          <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
            {plant.variety_name ?? `Variedade ${plant.variety_id}`}
          </Text>
          <Text numberOfLines={1} style={[styles.subtitle, { color: colors.disabledText }]}>
            {plant.zone_name ?? `Zona ${plant.zone_id}`}
          </Text>
        </View>
        <View
          accessibilityLabel={`Status: ${statusLabels[plant.sync_status]}`}
          style={[
            styles.badge,
            {
              backgroundColor:
                plant.sync_status === 'synced'
                  ? colors.activeTrackColor
                  : plant.sync_status === 'error'
                    ? theme === 'dark'
                      ? '#4A2424'
                      : '#FDECEC'
                    : colors.neutralButtonBackground,
            },
          ]}
        >
          {plant.sync_status === 'syncing' ? <ActivityIndicator color={colors.tint} size="small" /> : null}
          <Text style={[styles.badgeText, { color: plant.sync_status === 'error' ? colors.errorText : colors.text }]}>
            {statusLabels[plant.sync_status]}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Detail icon="event" text={`Plantio: ${new Date(plant.planting_date).toLocaleDateString('pt-BR')}`} />
        <Detail icon="my-location" text={`${plant.latitude.toFixed(6)}, ${plant.longitude.toFixed(6)}`} />
        {plant.gps_accuracy_m != null ? (
          <Detail icon="gps-fixed" text={`Precisão GPS: ${plant.gps_accuracy_m.toFixed(1)} m`} />
        ) : null}
      </View>

      {plant.sync_error ? (
        <Text accessibilityRole="alert" style={[styles.error, { color: colors.errorText }]}>
          {plant.sync_error}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          accessibilityLabel={`Excluir localmente ${plant.variety_name ?? 'planta'}`}
          accessibilityRole="button"
          android_ripple={{ color: colors.destructiveButtonBackground }}
          onPress={() => requestDelete()}
          onPressIn={() => setDeletePressed(true)}
          onPressOut={() => setDeletePressed(false)}
          style={[
            styles.actionButton,
            { borderColor: colors.cardBorder },
            isDeletePressed && styles.actionButtonPressed,
          ]}
          testID={`plant-registration-delete-${plant.id}`}
        >
          <MaterialIcons color={colors.danger} name="delete-outline" size={20} />
          <Text style={[styles.actionText, { color: colors.danger }]}>Excluir</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={`Sincronizar ${plant.variety_name ?? 'planta'}`}
          accessibilityRole="button"
          accessibilityState={{ busy: plant.sync_status === 'syncing', disabled: !canSync }}
          android_ripple={{ color: colors.activeTrackColor }}
          disabled={!canSync}
          onPress={() => requestSync()}
          onPressIn={() => setSyncPressed(true)}
          onPressOut={() => setSyncPressed(false)}
          style={[
            styles.actionButton,
            { borderColor: colors.cardBorder, opacity: canSync ? 1 : 0.5 },
            isSyncPressed && canSync && styles.actionButtonPressed,
          ]}
          testID={`plant-registration-sync-${plant.id}`}
        >
          <MaterialIcons color={colors.tint} name="sync" size={20} />
          <Text style={[styles.actionText, { color: colors.tint }]}>Sincronizar</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ReanimatedSwipeable
      friction={2}
      renderLeftActions={(_, __, swipeable) => (
        <RectButton
          activeOpacity={0.72}
          accessibilityLabel="Excluir planta localmente"
          onPress={() => requestDelete(swipeable)}
          style={[styles.swipeAction, styles.leftAction, { backgroundColor: colors.destructiveButtonBackground }]}
          testID={`plant-registration-swipe-delete-${plant.id}`}
        >
          <MaterialIcons color="#FFFFFF" name="delete-outline" size={24} />
          <Text style={styles.swipeText}>Excluir</Text>
        </RectButton>
      )}
      renderRightActions={
        canSync
          ? (_, __, swipeable) => (
              <RectButton
                activeOpacity={0.72}
                accessibilityLabel="Sincronizar planta"
                onPress={() => requestSync(swipeable)}
                style={[
                  styles.swipeAction,
                  styles.rightAction,
                  { backgroundColor: colors.confirmationButtonBackground },
                ]}
                testID={`plant-registration-swipe-sync-${plant.id}`}
              >
                <MaterialIcons color="#FFFFFF" name="sync" size={24} />
                <Text style={styles.swipeText}>Sincronizar</Text>
              </RectButton>
            )
          : undefined
      }
    >
      {card}
    </ReanimatedSwipeable>
  );
}

function Detail({ icon, text }: { icon: keyof typeof MaterialIcons.glyphMap; text: string }) {
  const theme = useColorScheme() ?? 'light';
  return (
    <View style={styles.detailRow}>
      <MaterialIcons color={Colors[theme].disabledText} name={icon} size={17} />
      <Text style={[styles.detailText, { color: Colors[theme].text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 44,
    overflow: 'hidden',
    paddingHorizontal: 8,
  },
  actionButtonPressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
  actionText: { fontSize: 13, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 10 },
  badge: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    maxWidth: 132,
    minHeight: 30,
    paddingHorizontal: 9,
  },
  badgeText: { fontSize: 11, fontWeight: '800' },
  card: { borderRadius: 14, borderWidth: 1, gap: 14, minHeight: 188, padding: 14 },
  detailRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  detailText: { fontSize: 14, lineHeight: 20 },
  details: { gap: 7 },
  error: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  iconBadge: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  leftAction: { borderBottomLeftRadius: 14, borderTopLeftRadius: 14 },
  rightAction: { borderBottomRightRadius: 14, borderTopRightRadius: 14 },
  subtitle: { fontSize: 13, lineHeight: 18 },
  swipeAction: { alignItems: 'center', justifyContent: 'center', width: 112 },
  swipeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', marginTop: 4 },
  title: { fontSize: 16, fontWeight: '800', lineHeight: 21 },
  titleGroup: { flex: 1, minWidth: 0 },
});
