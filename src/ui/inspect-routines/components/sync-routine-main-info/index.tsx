import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { ThemedText } from '@/shared/themes/themed-text';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { styles } from './styles';

export interface SyncRoutineMainInfoProps {
  inspectRoutineId: string | string[];
  numberOfPlants: number;
}

const SyncRoutineMainInfo: React.FC<SyncRoutineMainInfoProps> = ({ inspectRoutineId, numberOfPlants }) => {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';
  const tintColor = Colors[theme].tint;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerItem}>
            <View style={{ backgroundColor: isDark ? '#312E81' : '#EEF2FF', padding: 8, borderRadius: 10 }}>
              <Ionicons name="clipboard" size={20} color={tintColor} />
            </View>
            <ThemedText type="title">
              Rotina{' '}
              <ThemedText type="title" style={{ color: tintColor }}>
                #{typeof inspectRoutineId === 'string' ? inspectRoutineId.substring(0, 8).toUpperCase() : inspectRoutineId[0].substring(0, 8).toUpperCase()}
              </ThemedText>
            </ThemedText>
          </View>
          <View style={[
            styles.chip, 
            { 
              backgroundColor: isDark ? Colors[theme].card : '#FFFFFF', 
              borderColor: isDark ? Colors[theme].cardBorder : '#E5E7EB' 
            }
          ]}>
            <ThemedText style={[styles.chipText, { color: Colors[theme].confirmationButtonBackground }]}>
              {numberOfPlants} {numberOfPlants === 1 ? 'planta' : 'plantas'}
            </ThemedText>
          </View>
        </View>
        <ThemedText type="cardInfo" style={styles.subtitle}>
          Revise e aprove as alterações para sincronizar com o servidor.
        </ThemedText>
      </View>
    </View>
  );
};

export default SyncRoutineMainInfo;
