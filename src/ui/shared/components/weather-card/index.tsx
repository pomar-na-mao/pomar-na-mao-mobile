import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { styles } from './styles';

export function WeatherCard() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  const cardBackground = isDark ? Colors.dark.card : Colors.light.tint;
  const primaryTextColor = isDark ? Colors.dark.text : '#FFFFFF';
  const secondaryTextColor = isDark ? Colors.dark.disabledText : '#c6edc1';
  const iconColor = isDark ? Colors.dark.tint : '#FFFFFF';

  return (
    <ThemedView style={[styles.weatherCard, { backgroundColor: cardBackground }]}>
      <View style={styles.blurCircle} />
      <View style={styles.weatherTopHeader}>
        <MaterialIcons name="location-on" size={16} color={iconColor} style={{ opacity: 0.8 }} />
        <ThemedText style={[styles.weatherLocation, { color: primaryTextColor }]}>
          FAZENDA SANTA HELENA • BLOCO B
        </ThemedText>
      </View>

      <View style={styles.weatherMain}>
        <View>
          <ThemedText style={[styles.temperature, { color: primaryTextColor }]}>24°C</ThemedText>
          <ThemedText style={[styles.weatherStatic, { color: secondaryTextColor }]}>Céu limpo • Umidade 45%</ThemedText>
        </View>
      </View>

      <View style={styles.weatherGrid}>
        <View style={styles.weatherItem}>
          <MaterialIcons
            name="wb-sunny"
            size={28}
            color={isDark ? Colors.dark.warning : (Colors.light.secondary ?? '#FC8F34')}
          />
          <ThemedText style={[styles.weatherLabel, { color: primaryTextColor }]}>UV INDEX</ThemedText>
          <ThemedText style={[styles.weatherValue, { color: primaryTextColor }]}>Alto</ThemedText>
        </View>
        <View style={styles.weatherItem}>
          <MaterialIcons name="air" size={28} color={isDark ? Colors.dark.tint : '#aad0a6'} />
          <ThemedText style={[styles.weatherLabel, { color: primaryTextColor }]}>VENTO</ThemedText>
          <ThemedText style={[styles.weatherValue, { color: primaryTextColor }]}>12 km/h</ThemedText>
        </View>
        <View style={styles.weatherItem}>
          <MaterialIcons name="water-drop" size={28} color={isDark ? Colors.dark.blue : '#e7bdb1'} />
          <ThemedText style={[styles.weatherLabel, { color: primaryTextColor }]}>PRECIP.</ThemedText>
          <ThemedText style={[styles.weatherValue, { color: primaryTextColor }]}>0%</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}
