import { useRoutineSqliteService } from '@/data/services/routine/use-routine-sqlite-service';
import { useRoutineStore } from '@/data/store/routine/use-routine-store';
import type { PlantInformation } from '@/domain/models/inspect-routines/inspect-routines-informations.schema';
import type { HorizontalTab } from '@/domain/models/shared/horizontal-tab.model';
import type { BooleanKeys, PlantData } from '@/domain/models/shared/plant-data.model';
import { Colors } from '@/shared/constants/theme';
import { plantDataTabs } from '@/shared/constants/values';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import HorizontalTabBar from '@/ui/shared/components/horizontal-tabbar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlantInformationForm } from './plant-information-form';
import { PlantOccurrencesForm } from './plant-occurrences-form';
import { styles } from './style';

interface NearestPlantInRoutineModalDataProps {
  isDetailModalVisible: boolean;
  setIsDetailModalVisible: (isDetailModalVisible: boolean) => void;
  plant: PlantData | null;
}

export const NearestPlantInRoutineModalData: React.FC<NearestPlantInRoutineModalDataProps> = ({
  isDetailModalVisible,
  setIsDetailModalVisible,
  plant,
}) => {
  const [activeTab, setActiveTab] = useState(plantDataTabs[0]);

  const routineSqliteService = useRoutineSqliteService();
  const { searchPlantsData, setSearchPlantsData, setNearestPlant } = useRoutineStore();
  const { setMessage, setIsVisible } = useAlertBoxStore();
  const { setIsLoading } = useLoadingStore();
  const theme = useColorScheme() ?? 'light';

  const onRequestCloseModalHandler = () => {
    setActiveTab(plantDataTabs[0]);
    setIsDetailModalVisible(false);
  };

  const savePlantHandler = async (updatedPlant: PlantData) => {
    setIsLoading(true);

    try {
      await routineSqliteService.upsertPlant(updatedPlant);

      setSearchPlantsData(searchPlantsData.map((item) => (item.id === updatedPlant.id ? updatedPlant : item)));
      setNearestPlant(updatedPlant);
      setMessage('Planta salva localmente.');
      setIsVisible(true);
    } catch (error) {
      setMessage('Erro ao salvar planta localmente. Tente novamente.\n' + error);
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const savePlantInformation = async (plantInformationData: PlantInformation) => {
    if (!plant) {
      return;
    }

    await savePlantHandler({
      ...plant,
      variety: plantInformationData.variety ?? '',
      planting_date: plantInformationData.plantingDate.toISOString(),
      mass: plantInformationData.mass ?? '',
      life_of_the_tree: plantInformationData.lifeOfTree ?? '',
      harvest: plantInformationData.harvest ?? '',
      description: plantInformationData.description ?? '',
      updated_at: new Date().toISOString(),
      wasUpdated: true,
    });
  };

  const savePlantOccurrences = async (formState: Record<BooleanKeys, boolean>) => {
    if (!plant) {
      return;
    }

    await savePlantHandler({
      ...plant,
      ...formState,
      updated_at: new Date().toISOString(),
      wasUpdated: true,
    });
  };

  const onTabChangeHandler = (tab: HorizontalTab) => {
    setActiveTab(tab);
  };

  return (
    <View>
      <Modal
        visible={isDetailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={onRequestCloseModalHandler}
      >
        <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
          <SafeAreaView style={styles.searchFiltersContainer}>
            <View style={styles.closeIconContainer}>
              <Pressable onPress={onRequestCloseModalHandler}>
                <MaterialCommunityIcons name="close-circle" size={32} color={Colors[theme].danger} />
              </Pressable>
            </View>
            <KeyboardAvoidingView
              style={{ flex: 1, width: '100%' }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
            >
              <HorizontalTabBar tabs={plantDataTabs} onTabChange={onTabChangeHandler} />

              <View style={{ flex: 1 }}>
                <View style={{ flex: 1, display: activeTab.key === 'occurrences' ? 'flex' : 'none' }}>
                  <PlantOccurrencesForm plant={plant} savePlantOccurrencesHandler={savePlantOccurrences} />
                </View>
                <View style={{ flex: 1, display: activeTab.key === 'information' ? 'flex' : 'none' }}>
                  <PlantInformationForm plant={plant} savePlantInformationHandler={savePlantInformation} />
                </View>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};
