import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { ThemedText } from '@/shared/themes/themed-text';
import { ConfirmationModal } from '@/ui/shared/components/confirmation-modal';
import { formatDateToShortLabel } from '@/utils/date/dates';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { styles } from './styles';

export interface SyncAnnotationCardProps {
  date: string;
  occurrencesCount: number;
  style?: ViewStyle;
  isApproved?: boolean;
  onApproveAnnotation: () => void;
}

export const SyncAnnotationCard: React.FC<SyncAnnotationCardProps> = ({
  date,
  occurrencesCount,
  style,
  isApproved,
  onApproveAnnotation,
}) => {
  const theme = useColorScheme() ?? 'light';
  const tintColor = Colors[theme].tint;
  const isDark = theme === 'dark';
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleApprovePress = () => {
    setIsModalVisible(true);
  };

  const handleConfirmApproval = () => {
    onApproveAnnotation();
    setIsModalVisible(false);
  };

  const handleCancelApproval = () => {
    setIsModalVisible(false);
  };

  return (
    <View
      style={[
        styles.container,
        style,
        {
          backgroundColor: Colors[theme].card,
          opacity: isApproved ? 0.6 : 1,
        },
      ]}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isApproved ? Colors[theme].iconBackground : isDark ? '#312E81' : '#EEF2FF' },
          ]}
        >
          <Ionicons
            name={isApproved ? 'checkmark-circle' : 'leaf'}
            size={24}
            color={isApproved ? Colors[theme].confirmationButtonBackground : tintColor}
          />
        </View>
        <View style={styles.textContainer}>
          <ThemedText type="defaultSemiBold" style={{ color: Colors[theme].text }}>
            {formatDateToShortLabel(date)}
          </ThemedText>
          <ThemedText type="cardInfo" style={[styles.occurrencesText, { color: Colors[theme].icon }]}>
            {occurrencesCount} {occurrencesCount === 1 ? 'item identificado' : 'itens identificados'}
          </ThemedText>
        </View>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={[
            styles.approveButton,
            {
              backgroundColor: isApproved ? Colors[theme].iconBackground : Colors[theme].confirmationButtonBackground,
              shadowOpacity: isApproved ? 0 : 0.2,
            },
          ]}
          onPress={handleApprovePress}
          activeOpacity={0.7}
          disabled={isApproved}
        >
          <Ionicons
            name={isApproved ? 'checkmark-done' : 'cloud-upload-outline'}
            size={22}
            color={isApproved ? Colors[theme].icon : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      <ConfirmationModal
        visible={isModalVisible}
        title="Sincronizar"
        message="Deseja realmente sincronizar esta anotação com o servidor?"
        onConfirm={handleConfirmApproval}
        onCancel={handleCancelApproval}
      />
    </View>
  );
};
