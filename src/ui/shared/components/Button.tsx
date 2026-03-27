import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, useColorScheme } from 'react-native';

import { Colors } from '@/shared/constants/theme';
import { ThemedText } from '@/shared/themes/themed-text';
import type { TextStyle, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  isLoading = false,
  style,
  textStyle,
  variant,
}) => {
  const theme = useColorScheme() ?? 'light';

  const variantColor = variant ? (variant === 'primary' ? 'tint' : 'secondary') : 'tint';

  const backgroundColor = theme === 'dark' ? Colors.dark[variantColor] : Colors.light[variantColor];

  const textColor = theme === 'light' ? Colors.dark.text : Colors.light.text;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: backgroundColor, opacity: disabled || isLoading || pressed ? 0.7 : 1 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <ThemedText style={[styles.text, { color: textColor }, textStyle]}>{title}</ThemedText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
});

export default Button;
