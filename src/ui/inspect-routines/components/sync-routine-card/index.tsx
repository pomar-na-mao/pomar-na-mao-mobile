import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { ThemedText } from '@/shared/themes/themed-text';
import { formatDateToShortLabel } from '@/utils/date/dates';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { styles } from './styles';

export interface SyncRoutineCardProps {
  id: string;
  date: string;
  zone: string;
  style?: ViewStyle;
}

export const SyncRoutineCard: React.FC<SyncRoutineCardProps> = ({ id, date, zone, style }) => {
  const theme = useColorScheme() ?? 'light';
  const tintColor = Colors[theme].tint;
  const isDark = theme === 'dark';

  const handleNavigate = () => {
    router.replace({
      pathname: '/(inspect-routine)/inspect-routine-plants-sync-details/[id]',
      params: { id: id },
    });
  };

  return (
    <View
      style={[
        styles.container,
        style,
        { backgroundColor: Colors[theme].card }
      ]}
    >
      <View style={styles.leftSection}>
        <View style={[styles.badge, { backgroundColor: isDark ? '#312E81' : '#EEF2FF' }]}>
          <Ionicons
            name="list-outline"
            size={24}
            color={tintColor}
          />
        </View>
        <View style={styles.infoContainer}>
          <ThemedText type="defaultSemiBold" style={{ color: Colors[theme].text }}>
            {formatDateToShortLabel(date)}
          </ThemedText>
          <ThemedText type="cardInfo" style={{ color: Colors[theme].icon }}>
            Zona {zone} • #{id}
          </ThemedText>
        </View>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.approveButton,
            {
              backgroundColor: Colors[theme].confirmationButtonBackground,
              shadowOpacity: 0.2
            },
          ]}
          onPress={handleNavigate}
        >
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
