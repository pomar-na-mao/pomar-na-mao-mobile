import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { styles } from './styles';
import { useWeather } from './view-models/use-weather';

const WeatherCardSkeleton = ({
  cardBackground,
  primaryTextColor,
}: {
  cardBackground: string;
  primaryTextColor: string;
}) => {
  const opAnim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
        Animated.timing(opAnim, { toValue: 0.2, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [opAnim]);

  const skeletonColor = primaryTextColor;

  return (
    <ThemedView style={[styles.weatherCard, { backgroundColor: cardBackground }]}>
      <View style={styles.blurCircle} />

      <View style={styles.weatherTopHeader}>
        <Animated.View
          style={[styles.skeletonBlock, { opacity: opAnim, width: 140, height: 16, backgroundColor: skeletonColor }]}
        />
      </View>

      <View style={styles.weatherMain}>
        <View style={{ gap: 8 }}>
          <Animated.View
            style={[styles.skeletonBlock, { opacity: opAnim, width: 100, height: 48, backgroundColor: skeletonColor }]}
          />
          <Animated.View
            style={[styles.skeletonBlock, { opacity: opAnim, width: 160, height: 20, backgroundColor: skeletonColor }]}
          />
        </View>
      </View>

      <View style={styles.weatherGrid}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.weatherItem}>
            <Animated.View
              style={[
                styles.skeletonBlock,
                {
                  opacity: opAnim,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: skeletonColor,
                  marginBottom: 8,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.skeletonBlock,
                { opacity: opAnim, width: 60, height: 10, backgroundColor: skeletonColor, marginBottom: 4 },
              ]}
            />
            <Animated.View
              style={[styles.skeletonBlock, { opacity: opAnim, width: 40, height: 14, backgroundColor: skeletonColor }]}
            />
          </View>
        ))}
      </View>
    </ThemedView>
  );
};

export function WeatherCard() {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  const cardBackground = isDark ? Colors.dark.card : Colors.light.tint;
  const primaryTextColor = isDark ? Colors.dark.text : '#FFFFFF';
  const secondaryTextColor = isDark ? Colors.dark.disabledText : '#c6edc1';
  const iconColor = isDark ? Colors.dark.tint : '#FFFFFF';

  const { isLoading, weather, location, error, getUvText } = useWeather();

  if (isLoading) {
    return <WeatherCardSkeleton cardBackground={cardBackground} primaryTextColor={primaryTextColor} />;
  }

  const locationName = error ? 'Erro de localização' : location?.address || 'Localização obtida';
  const weatherDescription = error ? '-' : weather?.weatherDescription || '-';

  return (
    <ThemedView style={[styles.weatherCard, { backgroundColor: cardBackground }]}>
      <View style={styles.blurCircle} />
      <View style={styles.weatherTopHeader}>
        <MaterialIcons name="location-on" size={16} color={iconColor} style={{ opacity: 0.8 }} />
        <ThemedText style={[styles.weatherLocation, { color: primaryTextColor }]}>{locationName}</ThemedText>
      </View>

      <View style={styles.weatherMain}>
        <View>
          <ThemedText style={[styles.temperature, { color: primaryTextColor }]}>
            {weather ? `${weather.temperature}°C` : '--'}
          </ThemedText>
          <ThemedText style={[styles.weatherStatic, { color: secondaryTextColor }]}>
            {weatherDescription} {weather ? `• Umidade ${weather.humidity}%` : ''}
          </ThemedText>
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
          <ThemedText style={[styles.weatherValue, { color: primaryTextColor }]}>
            {weather ? getUvText(weather.uvIndex) : '--'}
          </ThemedText>
        </View>
        <View style={styles.weatherItem}>
          <MaterialIcons name="air" size={28} color={isDark ? Colors.dark.tint : '#aad0a6'} />
          <ThemedText style={[styles.weatherLabel, { color: primaryTextColor }]}>VENTO</ThemedText>
          <ThemedText style={[styles.weatherValue, { color: primaryTextColor }]}>
            {weather ? `${weather.windSpeed} km/h` : '--'}
          </ThemedText>
        </View>
        <View style={styles.weatherItem}>
          <MaterialIcons name="water-drop" size={28} color={isDark ? Colors.dark.blue : '#e7bdb1'} />
          <ThemedText style={[styles.weatherLabel, { color: primaryTextColor }]}>PRECIP.</ThemedText>
          <ThemedText style={[styles.weatherValue, { color: primaryTextColor }]}>
            {weather ? `${weather.precipitation} mm` : '--'}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}
