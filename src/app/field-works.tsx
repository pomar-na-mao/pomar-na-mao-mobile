import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import { MaterialIcons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const cards: {
  id: string;
  title: string;
  subtitle: string;
  route: Href | null;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  {
    id: 'inspect-routine',
    title: 'Insp. planta',
    subtitle: 'Avalie a saúde das árvores e pragas.',
    route: '/inspect-routine',
    icon: 'assignment',
  },
  {
    id: 'inspect-annotation',
    title: 'Insp. anotação',
    subtitle: 'Registre observações e diário de campo.',
    route: '/inspect-annotation',
    icon: 'event-note',
  },
  {
    id: 'pulverization',
    title: 'Pulverização',
    subtitle: 'Inicie o controle químico ou orgânico.',
    route: null,
    icon: 'water-drop',
  },
  {
    id: 'harvest',
    title: 'Colheita',
    subtitle: 'Registre a produção e qualidade.',
    route: null,
    icon: 'shopping-basket',
  },
];

export default function FieldWorks() {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';

  const handlePress = (route: Href | null) => {
    if (route) {
      router.push(route);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <View style={styles.topEmptySpace}></View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <ThemedView style={[styles.weatherCard, { backgroundColor: Colors[theme].tint }]}>
            <View style={styles.blurCircle} />
            <View style={styles.weatherTopHeader}>
              <MaterialIcons name="location-on" size={16} color="#FFFFFF" style={{ opacity: 0.8 }} />
              <ThemedText style={styles.weatherLocation}>FAZENDA SANTA HELENA • BLOCO B</ThemedText>
            </View>

            <View style={styles.weatherMain}>
              <View>
                <ThemedText style={styles.temperature}>24°C</ThemedText>
                <ThemedText style={styles.weatherStatic}>Céu limpo • Umidade 45%</ThemedText>
              </View>
            </View>

            <View style={styles.weatherGrid}>
              <View style={styles.weatherItem}>
                <MaterialIcons name="wb-sunny" size={28} color={Colors[theme].secondary ?? '#FC8F34'} />
                <ThemedText style={styles.weatherLabel}>UV INDEX</ThemedText>
                <ThemedText style={styles.weatherValue}>Alto</ThemedText>
              </View>
              <View style={styles.weatherItem}>
                <MaterialIcons name="air" size={28} color="#aad0a6" />
                <ThemedText style={styles.weatherLabel}>VENTO</ThemedText>
                <ThemedText style={styles.weatherValue}>12 km/h</ThemedText>
              </View>
              <View style={styles.weatherItem}>
                <MaterialIcons name="water-drop" size={28} color="#e7bdb1" />
                <ThemedText style={styles.weatherLabel}>PRECIP.</ThemedText>
                <ThemedText style={styles.weatherValue}>0%</ThemedText>
              </View>
            </View>
          </ThemedView>
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[styles.card, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].cardBorder }]}
              onPress={() => handlePress(card.route)}
              activeOpacity={card.route ? 0.7 : 1}
            >
              <View style={[styles.iconContainer, { backgroundColor: Colors[theme].background }]}>
                <MaterialIcons name={card.icon} size={32} color={Colors[theme].tint} />
              </View>
              <View style={styles.cardTextContainer}>
                <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                  {card.title}
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>{card.subtitle}</ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 18,
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 18,
    width: '100%',
  },
  topEmptySpace: {
    height: 12,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 16,
  },
  weatherCard: {
    padding: 32,
    paddingTop: 40, // Increased top padding
    borderRadius: 24,
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden', // Contains the blurCircle
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  blurCircle: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(252, 143, 52, 0.15)',
  },
  weatherTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  weatherLocation: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    opacity: 0.8,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  temperature: {
    fontSize: 44,
    lineHeight: 52, // Explicit line height to avoid top clipping
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  weatherStatic: {
    fontSize: 18,
    fontWeight: '500',
    color: '#c6edc1',
  },
  weatherGrid: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 32,
  },
  weatherItem: {
    alignItems: 'center',
  },
  weatherLabel: {
    fontSize: 10,
    marginTop: 4,
    marginBottom: 2,
    color: '#FFFFFF',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weatherValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  card: {
    width: '100%',
    minHeight: 120,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    position: 'relative',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
});
