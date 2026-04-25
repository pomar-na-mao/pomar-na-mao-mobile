import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import { WeatherCard } from '@/ui/shared/components/weather-card';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, type RelativePathString } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ExpoRouterPath } from './_layout';

interface CardItem {
  id: string;
  title: string;
  subtitle: string;
  route: ExpoRouterPath | null;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const cards: CardItem[] = [
  {
    id: 'routine',
    title: 'Rotina',
    subtitle: 'Inicie uma rotina para avaliação de ocorrências!',
    route: '/routine' as ExpoRouterPath,
    icon: 'work',
  },
  {
    id: 'inspect-annotation',
    title: 'Anotação',
    subtitle: 'Registre ocorrências identificadas em campo!',
    route: '/inspect-annotation' as ExpoRouterPath,
    icon: 'event-note',
  },
  {
    id: 'add-plant',
    title: 'Nova planta',
    subtitle: 'Adicione uma nova planta na base!',
    route: '/add-plant' as ExpoRouterPath,
    icon: 'local-florist',
  },
  {
    id: 'pulverization',
    title: 'Pulverização (Em Breve)',
    subtitle: 'Registre sua rota durante uma pulverização para registrar!',
    route: null,
    icon: 'water-drop',
  },
  {
    id: 'harvest',
    title: 'Colheita (Em breve)',
    subtitle: 'Registre sua rota durante a colheita para registrar!',
    route: null,
    icon: 'shopping-basket',
  },
];

export default function FieldWorks() {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';

  const handlePress = (route: string | null) => {
    if (route) {
      router.push(route as RelativePathString);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <View style={styles.topEmptySpace}></View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <WeatherCard />
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
