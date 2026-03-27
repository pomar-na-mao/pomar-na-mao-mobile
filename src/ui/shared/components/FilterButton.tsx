import React from 'react';
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { Colors } from '@/shared/constants/theme';
import { ThemedText } from '@/shared/themes/themed-text';
import { Ionicons } from '@expo/vector-icons';
import type { TextStyle, ViewStyle } from 'react-native';

interface FilterButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const FilterButton: React.FC<FilterButtonProps> = ({ title, onPress, disabled = false, style, textStyle }) => {
  const theme = useColorScheme() ?? 'light';

  const backgroundColor = theme === 'light' ? Colors.light.inputBackground : Colors.dark.inputBackground;

  const textColor = theme === 'dark' ? Colors.dark.icon : Colors.light.icon;

  const iconColor = theme === 'dark' ? Colors.dark.icon : Colors.light.icon;

  const shadowColor = theme === 'dark' ? Colors.light.grey : Colors.dark.grey;

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: backgroundColor,
            opacity: disabled || pressed ? 0.7 : 1,
            shadowColor: shadowColor,
          },
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <ThemedText type="tabItem" style={[styles.text, { color: textColor }, textStyle]}>
          {title}
        </ThemedText>
        <Ionicons name="filter" size={18} color={iconColor} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    elevation: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
});

export default FilterButton;
