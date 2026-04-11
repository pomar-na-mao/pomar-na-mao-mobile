/* eslint-disable max-len */
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { styles } from './styles';

const getWeatherDescription = (code: number) => {
  switch (code) {
    case 0:
      return 'Céu limpo';
    case 1:
    case 2:
    case 3:
      return 'Parcial. nublado';
    case 45:
    case 48:
      return 'Neblina';
    case 51:
    case 53:
    case 55:
      return 'Garoa';
    case 61:
    case 63:
    case 65:
      return 'Chuva';
    case 71:
    case 73:
    case 75:
      return 'Neve';
    case 95:
    case 96:
    case 99:
      return 'Tempestade';
    default:
      return '';
  }
};

const getUvText = (uv: number) => {
  if (uv <= 2) return 'Baixo';
  if (uv <= 5) return 'Mod.';
  if (uv <= 7) return 'Alto';
  if (uv <= 10) return 'M. Alto';
  return 'Extremo';
};

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

  const [isLoading, setIsLoading] = useState(true);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [windSpeed, setWindSpeed] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [uvIndex, setUvIndex] = useState<number | null>(null);
  const [precipitationProb, setPrecipitationProb] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>('Obtendo localização...');
  const [weatherDescription, setWeatherDescription] = useState<string>('Carregando...');

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationName('Acesso negado');
          setWeatherDescription('-');
          setIsLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const lat = location.coords.latitude;
        const lon = location.coords.longitude;

        let addressStr = 'LOCAL DESCONHECIDO';
        try {
          let address = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
          if (address && address.length > 0) {
            const city = address[0].city || address[0].subregion || address[0].district;
            const state = address[0].region;
            if (city && state) addressStr = `${city.toUpperCase()} • ${state.toUpperCase()}`;
            else if (city) addressStr = city.toUpperCase();
          }
        } catch {
          // keep default
        }
        setLocationName(addressStr);

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,uv_index&timezone=auto`,
        );
        const data = await response.json();

        if (data && data.current) {
          setTemperature(Math.round(data.current.temperature_2m));
          setHumidity(Math.round(data.current.relative_humidity_2m));
          setWindSpeed(Math.round(data.current.wind_speed_10m));
          setPrecipitationProb(data.current.precipitation || 0);
          setUvIndex(data.current.uv_index);
          setWeatherDescription(getWeatherDescription(data.current.weather_code));
        }
      } catch (error) {
        console.error('Error fetching weather', error);
        setLocationName('Erro de conexão');
        setWeatherDescription('-');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return <WeatherCardSkeleton cardBackground={cardBackground} primaryTextColor={primaryTextColor} />;
  }

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
            {temperature !== null ? `${temperature}°C` : '--'}
          </ThemedText>
          <ThemedText style={[styles.weatherStatic, { color: secondaryTextColor }]}>
            {weatherDescription} {humidity !== null ? `• Umidade ${humidity}%` : ''}
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
            {uvIndex !== null ? getUvText(uvIndex) : '--'}
          </ThemedText>
        </View>
        <View style={styles.weatherItem}>
          <MaterialIcons name="air" size={28} color={isDark ? Colors.dark.tint : '#aad0a6'} />
          <ThemedText style={[styles.weatherLabel, { color: primaryTextColor }]}>VENTO</ThemedText>
          <ThemedText style={[styles.weatherValue, { color: primaryTextColor }]}>
            {windSpeed !== null ? `${windSpeed} km/h` : '--'}
          </ThemedText>
        </View>
        <View style={styles.weatherItem}>
          <MaterialIcons name="water-drop" size={28} color={isDark ? Colors.dark.blue : '#e7bdb1'} />
          <ThemedText style={[styles.weatherLabel, { color: primaryTextColor }]}>PRECIP.</ThemedText>
          <ThemedText style={[styles.weatherValue, { color: primaryTextColor }]}>
            {precipitationProb !== null ? `${precipitationProb} mm` : '--'}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}
