import type { SprayingSession } from '@/domain/models/spraying/spraying.model';
import { Colors } from '@/shared/constants/theme';
import { EmptyList } from '@/ui/shared/components/empty-list';
import { useSpraying } from '@/ui/spraying/view-models/use-spraying';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

interface SprayingSessionsListProps {
  onStartNewSession: () => void;
}

function formatDate(value?: string | null) {
  if (!value) return 'Sem data';
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(session: SprayingSession) {
  if (!session.started_at || !session.ended_at) return 'Duração não registrada';

  const durationMs = new Date(session.ended_at).getTime() - new Date(session.started_at).getTime();
  if (durationMs <= 0) return 'Duração não registrada';

  const totalMinutes = Math.max(1, Math.round(durationMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

export const SprayingSessionsList: React.FC<SprayingSessionsListProps> = ({ onStartNewSession }) => {
  const theme = useColorScheme() ?? 'light';
  const { sessions, handleDeleteSession, handleResumeSession, handleEnterReviewMode } = useSpraying();

  const completedSessions = useMemo(() => sessions.filter((session) => session.status === 'completed'), [sessions]);

  const renderLeftActions = (session: SprayingSession, swipeable: SwipeableMethods) => (
    <RectButton
      style={[styles.swipeAction, styles.deleteAction]}
      onPress={() => {
        swipeable.close();
        handleDeleteSession(session.id);
      }}
    >
      <MaterialIcons name="delete-outline" size={26} color="#FFF" />
      <Text style={styles.swipeActionText}>Excluir</Text>
    </RectButton>
  );

  const renderRightActions = (session: SprayingSession, swipeable: SwipeableMethods) => (
    <RectButton
      style={[styles.swipeAction, styles.syncAction]}
      onPress={() => {
        swipeable.close();
        handleResumeSession(session);
        onStartNewSession();
        // Enter review mode after a tick so the map has time to mount
        setTimeout(() => handleEnterReviewMode(), 300);
      }}
    >
      <MaterialIcons name="sync" size={26} color="#FFF" />
      <Text style={styles.swipeActionText}>Sincronizar</Text>
    </RectButton>
  );

  const renderSession = ({ item }: { item: SprayingSession }) => {
    const isSynced = item.dirty === 0;

    return (
      <ReanimatedSwipeable
        friction={2}
        enableTrackpadTwoFingerGesture
        renderLeftActions={(_, __, swipeable) => renderLeftActions(item, swipeable)}
        renderRightActions={(_, __, swipeable) => renderRightActions(item, swipeable)}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: Colors[theme].card,
              borderColor: Colors[theme].cardBorder,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBadge, { backgroundColor: Colors[theme].logoBackground }]}>
              <MaterialIcons name="water-drop" size={22} color={Colors[theme].tint} />
            </View>

            <View style={styles.cardTitleGroup}>
              <Text selectable style={[styles.cardTitle, { color: Colors[theme].text }]}>
                {item.region ?? 'Região não informada'}
              </Text>
              <Text selectable style={[styles.cardSubtitle, { color: Colors[theme].disabledText }]}>
                {formatDate(item.ended_at ?? item.started_at)}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isSynced ? Colors[theme].activeTrackColor : Colors[theme].neutralButtonBackground },
              ]}
            >
              <Text style={[styles.statusText, { color: isSynced ? Colors[theme].tint : Colors[theme].disabledText }]}>
                {isSynced ? 'Sincronizada' : 'Local'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="person-outline" size={18} color={Colors[theme].icon} />
              <Text selectable style={[styles.infoText, { color: Colors[theme].text }]}>
                {item.operator_name ?? 'Operador não informado'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="timer" size={18} color={Colors[theme].icon} />
              <Text selectable style={[styles.infoText, { color: Colors[theme].text }]}>
                {formatDuration(item)}
              </Text>
            </View>
          </View>
        </View>
      </ReanimatedSwipeable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <FlatList
        data={completedSessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyList
            title="Nenhuma pulverização finalizada"
            subtitle="Toque no botão de adicionar para registrar uma nova pulverização."
          />
        }
      />

      <Pressable style={[styles.fab, { backgroundColor: Colors[theme].tint }]} onPress={onStartNewSession}>
        <MaterialIcons name="add" size={30} color="#FFF" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    gap: 12,
    padding: 16,
    paddingBottom: 104,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    gap: 14,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  iconBadge: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  cardTitleGroup: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 13,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoRow: {
    gap: 8,
  },
  infoItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
  },
  swipeAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    width: 112,
  },
  deleteAction: {
    backgroundColor: '#B91C1C',
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
  },
  syncAction: {
    backgroundColor: '#166534',
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
  },
  swipeActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  fab: {
    alignItems: 'center',
    borderRadius: 30,
    bottom: 28,
    height: 60,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    width: 60,
  },
});
