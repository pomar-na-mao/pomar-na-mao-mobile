import type { LoadedFieldWorkZone } from '@/data/services/shared/field-work-plant-cache-service';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { FieldWorkPlantClearModal } from '@/ui/shared/components/field-work-plant-clear-modal';
import { FieldWorkPlantLoadModal } from '@/ui/shared/components/field-work-plant-load-modal';
import { useFieldWorkPlantLoader } from '@/ui/shared/hooks/use-field-work-plant-loader';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

type ClearTarget = LoadedFieldWorkZone | 'all' | null;

export function FieldWorkLoadedDataCard() {
  const theme = useColorScheme() ?? 'light';
  const plantLoader = useFieldWorkPlantLoader();
  const hasLoadedPlants = plantLoader.loadedZones.length > 0;
  const loadedPlantCount = plantLoader.loadedZones.reduce((total, zone) => total + zone.plantCount, 0);
  const loadedAreaLabel = plantLoader.loadedZones.length === 1 ? 'área' : 'áreas';
  const loadedPlantLabel = loadedPlantCount === 1 ? 'planta' : 'plantas';
  const loadedDataSummary =
    `${plantLoader.loadedZones.length} ${loadedAreaLabel}` + ` · ${loadedPlantCount} ${loadedPlantLabel}`;
  const [clearTarget, setClearTarget] = useState<ClearTarget>(null);

  const clearSelectedPlants = () =>
    clearTarget === 'all'
      ? plantLoader.clearAllPlants()
      : clearTarget
        ? plantLoader.clearZonePlants(clearTarget.id)
        : Promise.resolve();

  const renderRemoveAction = (zone: LoadedFieldWorkZone, swipeable: SwipeableMethods) => (
    <RectButton
      accessibilityLabel={`Remover plantas de ${zone.name}`}
      onPress={() => {
        swipeable.close();
        setClearTarget(zone);
      }}
      style={[styles.swipeAction, { backgroundColor: Colors[theme].destructiveButtonBackground }]}
      testID={`field-work-remove-zone-${zone.id}`}
    >
      <MaterialIcons name="delete-outline" size={22} color="#FFFFFF" />
      <ThemedText style={styles.swipeActionText}>Remover</ThemedText>
    </RectButton>
  );

  return (
    <>
      <View
        style={[styles.card, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].cardBorder }]}
        testID="field-work-loaded-data-card"
      >
        <View style={styles.header}>
          <View style={styles.heading}>
            <View style={[styles.headingIcon, { backgroundColor: Colors[theme].activeTrackColor }]}>
              <MaterialIcons name="forest" size={22} color={Colors[theme].tint} />
            </View>
            <View style={styles.headingText}>
              <ThemedText type="defaultSemiBold" style={styles.title}>
                Plantas
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: Colors[theme].disabledText }]}>
                {hasLoadedPlants ? loadedDataSummary : 'Disponíveis mesmo sem internet'}
              </ThemedText>
            </View>
          </View>

          <TouchableOpacity
            accessibilityLabel="Excluir todas as plantas carregadas"
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasLoadedPlants }}
            activeOpacity={0.7}
            disabled={!hasLoadedPlants}
            onPress={() => setClearTarget('all')}
            style={[
              styles.clearButton,
              { backgroundColor: theme === 'dark' ? '#482626' : '#FDECEC' },
              !hasLoadedPlants && styles.buttonDisabled,
            ]}
            testID="field-work-clear-plants-button"
          >
            <MaterialIcons name="delete-outline" size={22} color={Colors[theme].danger} />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Abrir carregamento de plantas"
            accessibilityRole="button"
            activeOpacity={0.75}
            onPress={plantLoader.open}
            style={[styles.loadButton, { backgroundColor: Colors[theme].tint }]}
            testID="field-work-load-plants-button"
          >
            <MaterialIcons name="download-for-offline" size={20} color={theme === 'dark' ? '#142115' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>

        {!hasLoadedPlants ? (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: theme === 'dark' ? '#243025' : '#F3F7F3',
                borderColor: Colors[theme].line,
              },
            ]}
            testID="field-work-loaded-data-banner"
          >
            <View style={[styles.emptyIcon, { backgroundColor: Colors[theme].activeTrackColor }]}>
              <TouchableOpacity
                accessibilityLabel="Abrir carregamento de plantas"
                accessibilityRole="button"
                activeOpacity={0.75}
                onPress={plantLoader.open}
                testID="field-work-load-plants-button-in-message"
              >
                <MaterialIcons name="cloud-download" size={27} color={Colors[theme].tint} />
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.emptyTitle}>Nenhuma planta carregada</ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: Colors[theme].disabledText }]}>
              Carregue as plantas antes de ir a campo para liberar as atividades e trabalhar offline.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.loadedContent}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Áreas disponíveis offline</ThemedText>
              <View style={styles.swipeHint}>
                <MaterialIcons name="swipe" size={15} color={Colors[theme].disabledText} />
                <ThemedText style={[styles.swipeHintText, { color: Colors[theme].disabledText }]}>Remover</ThemedText>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.zoneSummaryContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator={plantLoader.loadedZones.length > 2}
              style={styles.zoneSummary}
              testID="field-work-loaded-zones-scroll"
            >
              {plantLoader.loadedZones.map((zone) => (
                <ReanimatedSwipeable
                  friction={2}
                  key={zone.id}
                  renderLeftActions={(_, __, swipeable) => renderRemoveAction(zone, swipeable)}
                >
                  <View
                    style={[
                      styles.zoneRow,
                      {
                        backgroundColor: theme === 'dark' ? '#263427' : '#F6F8F6',
                        borderColor: Colors[theme].line,
                      },
                    ]}
                  >
                    <View style={[styles.zoneIcon, { backgroundColor: Colors[theme].activeTrackColor }]}>
                      <MaterialIcons name="location-on" size={17} color={Colors[theme].tint} />
                    </View>
                    <ThemedText numberOfLines={1} style={styles.zoneName}>
                      {zone.name}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.zoneCount,
                        {
                          backgroundColor: Colors[theme].activeTrackColor,
                          color: Colors[theme].tint,
                        },
                      ]}
                    >
                      {zone.plantCount} {zone.plantCount === 1 ? 'planta' : 'plantas'}
                    </ThemedText>
                  </View>
                </ReanimatedSwipeable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
      <FieldWorkPlantLoadModal loader={plantLoader} />
      <FieldWorkPlantClearModal
        onClose={() => setClearTarget(null)}
        onConfirm={clearSelectedPlants}
        visible={clearTarget !== null}
        zoneName={clearTarget !== 'all' && clearTarget ? clearTarget.name : undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: { opacity: 0.35 },
  card: {
    alignItems: 'stretch',
    borderRadius: 20,
    borderWidth: 1,
    elevation: 2,
    height: 280,
    padding: 16,
    shadowColor: '#182019',
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    width: '100%',
  },
  clearButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    marginLeft: 8,
    width: 44,
  },
  emptyDescription: { fontSize: 13, lineHeight: 19, maxWidth: 270, textAlign: 'center' },
  emptyIcon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: 8,
    width: 48,
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    marginTop: 14,
    paddingHorizontal: 18,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', lineHeight: 22, marginBottom: 2 },
  header: { alignItems: 'center', flexDirection: 'row', width: '100%' },
  heading: { alignItems: 'center', flex: 1, flexDirection: 'row', minWidth: 0 },
  headingIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    marginRight: 10,
    width: 42,
  },
  headingText: { flex: 1, minWidth: 0 },
  loadButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    height: 44,
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 12,
  },
  loadedContent: { flex: 1, marginTop: 14 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  subtitle: { fontSize: 11, lineHeight: 16, marginTop: 1 },
  swipeAction: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginRight: 8,
    paddingHorizontal: 14,
  },
  swipeActionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  swipeHint: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  swipeHintText: { fontSize: 11, lineHeight: 16 },
  title: { fontSize: 16, fontWeight: '700', lineHeight: 21 },
  zoneCount: {
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  zoneIcon: {
    alignItems: 'center',
    borderRadius: 9,
    height: 30,
    justifyContent: 'center',
    marginRight: 9,
    width: 30,
  },
  zoneName: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  zoneRow: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  zoneSummary: { flex: 1, width: '100%' },
  zoneSummaryContent: { gap: 8, paddingBottom: 2 },
});
