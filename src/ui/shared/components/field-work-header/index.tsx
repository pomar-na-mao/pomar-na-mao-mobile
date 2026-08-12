import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { MaterialIcons } from '@expo/vector-icons';
import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

type FieldWorkHeaderProps = {
  title: string;
  subtitle?: string;
  onBackPress: () => void;
  backAccessibilityLabel: string;
  rightAccessory?: ReactNode;
  rightAccessoryStyle?: StyleProp<ViewStyle>;
  backButtonTestID?: string;
};

export function FieldWorkHeader({
  title,
  subtitle,
  onBackPress,
  backAccessibilityLabel,
  rightAccessory,
  rightAccessoryStyle,
  backButtonTestID,
}: FieldWorkHeaderProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.cardBorder }]}>
      <Pressable
        accessibilityLabel={backAccessibilityLabel}
        accessibilityRole="button"
        onPress={onBackPress}
        style={[styles.backButton, { borderColor: colors.cardBorder }]}
        testID={backButtonTestID}
      >
        <MaterialIcons name="arrow-back" color={colors.text} size={20} />
      </Pressable>

      <View style={styles.titleGroup}>
        <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={[styles.subtitle, { color: colors.disabledText }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.rightAccessory, rightAccessoryStyle]}>{rightAccessory ?? <View style={styles.placeholder} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  placeholder: {
    height: 40,
    width: 40,
  },
  rightAccessory: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 40,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  titleGroup: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
});
