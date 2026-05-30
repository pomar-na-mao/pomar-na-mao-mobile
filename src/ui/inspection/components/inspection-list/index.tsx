import type { InspectionListItem } from '@/domain/models/inspection';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { EmptyList } from '@/ui/shared/components/empty-list';
import { formatInspectionDateTime } from '@/ui/inspection/helpers/inspection-list-formatters';
import { useInspection } from '@/ui/inspection/view-models/use-inspection';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

interface InspectionListProps {
  compact?: boolean;
}

export const InspectionList: React.FC<InspectionListProps> = ({ compact = false }) => {
  const theme = useColorScheme() ?? 'light';
  const { inspections, syncInspection } = useInspection();

  const renderRightActions = (inspection: InspectionListItem, swipeable: SwipeableMethods) => (
    <RectButton
      style={[styles.swipeAction, { backgroundColor: Colors[theme].confirmationButtonBackground }]}
      onPress={() => {
        swipeable.close();
        syncInspection(inspection.id);
      }}
    >
      <MaterialIcons name="sync" size={24} color="#FFFFFF" />
      <Text style={styles.swipeActionText}>Sincronizar</Text>
    </RectButton>
  );

  const renderItem = ({ item }: { item: InspectionListItem }) => {
    const canSync = item.status === 'finished' && item.syncStatus !== 'synced';

    const content = (
      <View style={[styles.card, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].cardBorder }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBadge, { backgroundColor: Colors[theme].logoBackground }]}>
            <MaterialIcons name="fact-check" size={20} color={Colors[theme].tint} />
          </View>
          <View style={styles.titleGroup}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.title, { color: Colors[theme].text }]}>
              {item.zoneName ?? 'Todas as zonas'}
            </Text>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={[styles.subtitle, { color: Colors[theme].disabledText }]}
            >
              {item.occurrenceName ?? 'Todas as ocorrências'} -{' '}
              {formatInspectionDateTime(item.finishedAt ?? item.startedAt)}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  item.syncStatus === 'synced' ? Colors[theme].activeTrackColor : Colors[theme].neutralButtonBackground,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.badgeText,
                { color: item.syncStatus === 'synced' ? Colors[theme].tint : Colors[theme].disabledText },
              ]}
            >
              {item.syncStatus === 'synced' ? 'Sincronizada' : item.status === 'finished' ? 'Pendente' : 'Em campo'}
            </Text>
          </View>
        </View>

        <View style={styles.metrics}>
          <Text style={[styles.metricText, { color: Colors[theme].text }]}>
            {item.plantsLoadedCount} plantas carregadas
          </Text>
          <Text style={[styles.metricText, { color: Colors[theme].text }]}>
            {item.plantsChangedCount} plantas alteradas
          </Text>
        </View>

        {canSync ? (
          <Pressable
            style={[styles.syncButton, { backgroundColor: Colors[theme].confirmationButtonBackground }]}
            onPress={() => syncInspection(item.id)}
          >
            <MaterialIcons name="sync" size={17} color="#FFFFFF" />
            <Text style={styles.syncButtonText}>Sincronizar</Text>
          </Pressable>
        ) : null}
      </View>
    );

    if (!canSync) {
      return content;
    }

    return (
      <ReanimatedSwipeable
        friction={2}
        enableTrackpadTwoFingerGesture
        renderRightActions={(_, __, swipeable) => renderRightActions(item, swipeable)}
      >
        {content}
      </ReanimatedSwipeable>
    );
  };

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <FlatList
        data={inspections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal={compact}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, compact && styles.compactListContent]}
        ListEmptyComponent={
          compact ? null : (
            <EmptyList
              title="Nenhuma inspeção local"
              subtitle="Carregue plantas por filtro para iniciar uma inspeção."
            />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: 999,
    flexShrink: 0,
    maxWidth: 92,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    alignSelf: 'center',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12,
    width: 312,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  compactContainer: {
    alignItems: 'center',
    maxHeight: 152,
  },
  compactListContent: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  container: {
    width: '100%',
  },
  iconBadge: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  listContent: {
    gap: 12,
    padding: 16,
  },
  metrics: {
    gap: 4,
  },
  metricText: {
    fontSize: 13,
    lineHeight: 18,
  },
  subtitle: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  swipeAction: {
    alignItems: 'center',
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 18,
    width: 112,
  },
  swipeActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  syncButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 19,
  },
  titleGroup: {
    flex: 1,
    flexShrink: 1,
    gap: 2,
    minWidth: 0,
  },
});
