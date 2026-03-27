import { Entypo } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, View, ViewStyle } from 'react-native';

import type { RoutinePlants } from '@/domain/models/inspect-routines/inspect-routines.model';
import type { BooleanKeys, PlantData } from '@/domain/models/shared/plant-data.model';
import { Colors } from '@/shared/constants/theme';
import { occurencesLabels } from '@/shared/constants/values';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import Button from '@/ui/shared/components/Button';
import { EmptyList } from '@/ui/shared/components/empty-list';
import { getChangedOccurrenceDiff } from '@/utils/plant-data/compare';
import { useInspectRoutinePlantsSyncDetails } from '../../view-models/useInspectRoutinePlantsSyncDetails';
import { styles } from './styles';

export interface SyncRoutinePlantCardProps {
  plantWithUpdates: RoutinePlants;
  currentIndex: number;
  totalItems: number;
  style?: ViewStyle;
}

const SyncRoutinePlantCard: React.FC<SyncRoutinePlantCardProps> = ({
  plantWithUpdates,
  currentIndex,
  totalItems,
  style,
}) => {
  const [isApproveDisabled, setIsApproveDisabled] = useState(true);

  const [currentPlant, setCurrentPlant] = useState<RoutinePlants | PlantData | null>(null);

  const { searchPlantDetailHandler, syncPlantDataHandler } = useInspectRoutinePlantsSyncDetails();

  const [changedOccurrences, setChangedOccurrences] = useState<Partial<Record<BooleanKeys, boolean>>>({});

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (mounted) await checkPlantOccurrencesHandler();
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const isApproveDisabled = plantWithUpdates.is_approved || Object.values(changedOccurrences).length === 0;
    setIsApproveDisabled(isApproveDisabled);
  }, [plantWithUpdates, changedOccurrences]);

  const syncPlantsHandler = async () => {
    await syncPlantDataHandler(plantWithUpdates);
    await checkPlantOccurrencesHandler();
  };

  const checkPlantOccurrencesHandler = async () => {
    const { data: plantWithoutUpdates, error } = await searchPlantDetailHandler(plantWithUpdates.plant_id);

    if (!error && plantWithoutUpdates) {
      setCurrentPlant(plantWithoutUpdates);
      const changedOccurrences = getChangedOccurrenceDiff(plantWithoutUpdates, plantWithUpdates);
      setChangedOccurrences(changedOccurrences);
    }
  };

  const theme = useColorScheme() ?? 'light';

  return (
    <View style={[styles.card, style, { backgroundColor: Colors[theme].card }]}>
      {plantWithUpdates && currentPlant ? (
        <>
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <ThemedText type="subtitle">Planta</ThemedText>
              <ThemedText type="subtitle" style={{ color: Colors[theme].tint }}>
                #{plantWithUpdates?.plant_id.split('-')[0]}...
              </ThemedText>
            </View>
            <ThemedText type="subtitle">
              {currentIndex}/{totalItems}
            </ThemedText>
          </View>
          <ThemedText
            type="subtitle"
            style={[
              styles.syncStatusText,
              { backgroundColor: plantWithUpdates.is_approved ? Colors[theme].tint : Colors[theme].secondary },
            ]}
          >
            <ThemedText type="subtitle" style={{ color: theme === 'light' ? Colors.dark.text : Colors.light.text }}>
              {plantWithUpdates.is_approved ? 'Aprovada' : 'Pendente'}
            </ThemedText>
          </ThemedText>

          {isApproveDisabled ? (
            <EmptyList title="Sem alterações" subtitle="Nenhuma alteração disponível ou sincronização já realizada!" />
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.plantChangesInfo}
            >
              {Object.entries(changedOccurrences).map(([key, value]) => (
                <View key={key} style={[styles.switchRow, { backgroundColor: Colors[theme].grey }]}>
                  <ThemedText type="cardInfo">{occurencesLabels[key]}</ThemedText>
                  {value ? (
                    <Entypo name="circle-with-plus" size={24} color={Colors[theme].blue} />
                  ) : (
                    <Entypo name="circle-with-minus" size={24} color={Colors[theme].danger} />
                  )}
                </View>
              ))}
            </ScrollView>
          )}

          <Button title="Aprovar" onPress={syncPlantsHandler} disabled={isApproveDisabled} />
        </>
      ) : null}
    </View>
  );
};

export default SyncRoutinePlantCard;
