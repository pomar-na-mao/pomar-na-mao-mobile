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
    id: 'inspection',
    title: 'Inspeção',
    subtitle: 'Inspeção em campo para avaliar ocorrências',
    route: '/inspection' as ExpoRouterPath,
    icon: 'fact-check',
  },
  {
    id: 'annotation',
    title: 'Anotação',
    subtitle: 'Registre ocorrências em campo para uma planta',
    route: '/annotation' as ExpoRouterPath,
    icon: 'edit-location-alt',
  },
  {
    id: 'spraying',
    title: 'Pulverização',
    subtitle: 'Registre a rota e revise as plantas tratadas',
    route: '/spraying' as ExpoRouterPath,
    icon: 'agriculture',
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
  card: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 120,
    padding: 20,
    position: 'relative',
    width: '100%',
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  contentContainer: {
    gap: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginRight: 20,
    width: 64,
  },
  topEmptySpace: {
    height: 12,
  },
});
