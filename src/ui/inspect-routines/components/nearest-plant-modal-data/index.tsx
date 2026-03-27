import type { PlantInformation } from '@/domain/models/inspect-routines/inspect-routines-informations.schema';
import type { HorizontalTab } from '@/domain/models/shared/horizontal-tab.model';
import type { BooleanKeys } from '@/domain/models/shared/plant-data.model';
import { Colors } from '@/shared/constants/theme';
import { plantDataTabs } from '@/shared/constants/values';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import HorizontalTabBar from '@/ui/shared/components/horizontal-tabbar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInspectRoutineInActionDetection } from '../../view-models/useInspectRoutineInActionDetection';
import { PlantInformationForm } from './plant-information-form';
import { PlantOccurrencesForm } from './plant-occurrences-form';
import { styles } from './style';

interface NearestPlantModalDataProps {
  isDetailModalVisible: boolean;
  setIsDetailModalVisible: (isDetailModalVisible: boolean) => void;
}

export const NearestPlantModalData: React.FC<NearestPlantModalDataProps> = ({
  isDetailModalVisible,
  setIsDetailModalVisible,
}) => {
  const [activeTab, setActiveTab] = useState(plantDataTabs[0]);

  const { updatePlantOccurrencesHandler, updatePlantInformationHandler } = useInspectRoutineInActionDetection();

  const updatePlantInformation = async (plantInformationData: PlantInformation) => {
    await updatePlantInformationHandler(plantInformationData);
  };

  const updatePlantOccurrences = async (formState: Record<BooleanKeys, boolean>) => {
    await updatePlantOccurrencesHandler(formState);
  };

  const theme = useColorScheme() ?? 'light';

  const onRequestCloseModalHandler = () => {
    setActiveTab(plantDataTabs[0]);
    setIsDetailModalVisible(false);
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
                  <PlantOccurrencesForm updatePlantOccurrencesHandler={updatePlantOccurrences} />
                </View>
                <View style={{ flex: 1, display: activeTab.key === 'information' ? 'flex' : 'none' }}>
                  <PlantInformationForm updatePlantInformationHandler={updatePlantInformation} />
                </View>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};
