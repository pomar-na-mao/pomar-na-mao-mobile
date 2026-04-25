import { Colors } from '@/shared/constants/theme';
import { ThemedView } from '@/shared/themes/themed-view';
import { useAnnotation } from '@/ui/annotation/view-models/useAnnotation';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlantAnnotationForm, type PlantAnnotationData } from './plant-annotation-form';
import { RealTimeLocationCard } from './real-time-location-card';

interface AnnotationInsertProps {
  closeMenu: () => void;
}

export const AnnotationInsert: React.FC<AnnotationInsertProps> = ({ closeMenu }) => {
  const theme = useColorScheme() ?? 'light';

  const { submitAnnotation } = useAnnotation();

  const submitAnnotationHandler = async (data: PlantAnnotationData) => {
    await submitAnnotation(data);

    closeMenu();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1, padding: 12 }}>
        <View style={styles.closeIconContainer}>
          <Pressable onPress={closeMenu}>
            <MaterialCommunityIcons name="close-circle" size={32} color={Colors[theme].danger} />
          </Pressable>
        </View>

        <RealTimeLocationCard />

        <PlantAnnotationForm onSubmit={submitAnnotationHandler} />
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  closeIconContainer: {
    alignItems: 'flex-end',
    width: '100%',
    marginTop: 10,
    marginRight: 24,
  },
});
