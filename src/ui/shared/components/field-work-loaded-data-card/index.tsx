import { Colors } from '@/shared/constants/theme';
import type { LoadedFieldWorkZone } from '@/data/services/shared/field-work-plant-cache-service';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { FieldWorkPlantClearModal } from '@/ui/shared/components/field-work-plant-clear-modal';
import { FieldWorkPlantLoadModal } from '@/ui/shared/components/field-work-plant-load-modal';
import { useFieldWorkPlantLoader } from '@/ui/shared/hooks/use-field-work-plant-loader';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

type ClearTarget = LoadedFieldWorkZone | 'all' | null;

export function FieldWorkLoadedDataCard() {
  const theme = useColorScheme() ?? 'light';
  const plantLoader = useFieldWorkPlantLoader();
  const hasLoadedPlants = plantLoader.loadedZones.length > 0;
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
        style={[styles.card, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].tint }]}
        testID="field-work-loaded-data-card"
      >
        <View style={styles.header}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            Carregar plantas
          </ThemedText>
          <TouchableOpacity
            accessibilityLabel="Excluir todas as plantas carregadas"
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasLoadedPlants }}
            activeOpacity={0.7}
            disabled={!hasLoadedPlants}
            hitSlop={10}
            onPress={() => setClearTarget('all')}
            style={[styles.iconButton, !hasLoadedPlants && styles.iconButtonDisabled]}
            testID="field-work-clear-plants-button"
          >
            <MaterialIcons name="delete-outline" size={32} color={Colors[theme].danger} />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Abrir carregamento de plantas"
            accessibilityRole="button"
            activeOpacity={0.7}
            hitSlop={10}
            onPress={plantLoader.open}
            style={styles.iconButton}
            testID="field-work-load-plants-button"
          >
            <MaterialIcons name="download-for-offline" size={40} color={Colors[theme].tint} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.banner,
            {
              backgroundColor: theme === 'dark' ? '#4A3708' : '#FEF3C7',
              borderColor: theme === 'dark' ? '#B7791F' : '#F59E0B',
            },
          ]}
          testID="field-work-loaded-data-banner"
        >
          <MaterialIcons name="info-outline" size={22} color={theme === 'dark' ? '#FDE68A' : '#92400E'} />
          <View style={styles.bannerTextContainer}>
            <ThemedText style={[styles.bannerTitle, { color: theme === 'dark' ? '#FEF3C7' : '#78350F' }]}>
              Plantas necessárias
            </ThemedText>
            <ThemedText type="cardInfo" style={[styles.hint, { color: theme === 'dark' ? '#FDE68A' : '#92400E' }]}>
              Carregue plantas para liberar algumas atividades!
            </ThemedText>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.zoneSummaryContent}
          nestedScrollEnabled
          showsVerticalScrollIndicator={plantLoader.loadedZones.length > 2}
          style={styles.zoneSummary}
          testID="field-work-loaded-zones-scroll"
        >
          {plantLoader.loadedZones.length > 0 ? (
            plantLoader.loadedZones.map((zone) => (
              <ReanimatedSwipeable
                friction={2}
                key={zone.id}
                renderLeftActions={(_, __, swipeable) => renderRemoveAction(zone, swipeable)}
              >
                <View style={[styles.zoneRow, { backgroundColor: theme === 'dark' ? '#263B27' : '#F0F7F0' }]}>
                  <ThemedText style={styles.zoneName}>{zone.name}</ThemedText>
                  <ThemedText
                    style={[
                      styles.zoneCount,
                      {
                        backgroundColor: theme === 'dark' ? '#3D5A3E' : '#D1E2D2',
                        color: Colors[theme].tint,
                      },
                    ]}
                  >
                    {zone.plantCount} {zone.plantCount === 1 ? 'planta' : 'plantas'}
                  </ThemedText>
                </View>
              </ReanimatedSwipeable>
            ))
          ) : (
            <ThemedText style={styles.emptyText}>Nenhuma planta carregada</ThemedText>
          )}
        </ScrollView>
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
  banner: {
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    padding: 8,
    width: '100%',
  },
  bannerTextContainer: { flex: 1 },
  bannerTitle: { fontSize: 14, fontWeight: '700' },
  card: {
    alignItems: 'stretch',
    borderRadius: 12,
    borderWidth: 0.7,
    height: 'auto',
    padding: 12,
    width: '100%',
  },
  emptyText: { fontSize: 14, marginTop: 4, opacity: 0.7 },
  header: { alignItems: 'center', flexDirection: 'row', width: '100%' },
  hint: { fontSize: 13, marginTop: 4 },
  iconButton: { alignItems: 'center', justifyContent: 'center', marginLeft: 16 },
  iconButtonDisabled: { opacity: 0.35 },
  swipeAction: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginRight: 8,
    paddingHorizontal: 14,
  },
  swipeActionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  title: { flex: 1, fontSize: 18, fontWeight: '600' },
  zoneCount: {
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '600',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  zoneName: { flex: 1, fontSize: 14, fontWeight: '500' },
  zoneRow: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  zoneSummary: { flex: 1, marginTop: 18, width: '100%' },
  zoneSummaryContent: { gap: 8, paddingBottom: 2 },
});
