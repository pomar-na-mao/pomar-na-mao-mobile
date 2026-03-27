import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ColorValue, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { styles } from './styles';

type RoutineCardOptionProps = TouchableOpacityProps & {
  icon: keyof typeof MaterialIcons.glyphMap;
  backgroundColor: ColorValue;
  onPress?: () => void;
};

export const RoutineCardOption = ({ icon, backgroundColor, onPress, ...rest }: RoutineCardOptionProps) => {
  const theme = useColorScheme() ?? 'light';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.container, { backgroundColor }]}>
      <MaterialIcons name={icon} size={24} color={theme === 'light' ? Colors['dark'].text : Colors['light'].text} />
    </TouchableOpacity>
  );
};
