import { Colors } from '@/shared/constants/theme';
import { ThemedText } from '@/shared/themes/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';

interface CollapsibleProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  maxHeight?: number;
  children: React.ReactNode;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  title,
  subtitle,
  defaultOpen = false,
  maxHeight = 400,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const theme = useColorScheme() ?? 'light';
  const rotation = useSharedValue(defaultOpen ? 1 : 0);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    rotation.value = withTiming(isOpen ? 0 : 1, { duration: 250 });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Pressable
        onPress={toggleOpen}
        style={({ pressed }) => [styles.header, { borderBottomColor: Colors[theme].line, opacity: pressed ? 0.6 : 1 }]}
      >
        <View style={styles.headerTextContainer}>
          <ThemedText type="default" style={styles.headerTitle}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText type="default" style={[styles.headerSubtitle, { color: Colors[theme].icon }]}>
              {subtitle}
            </ThemedText>
          )}
        </View>
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-down" size={20} color={Colors[theme].icon} />
        </Animated.View>
      </Pressable>

      {isOpen && (
        <ScrollView
          style={[styles.content, { maxHeight }]}
          showsVerticalScrollIndicator
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  content: {
    paddingTop: 12,
  },
});
