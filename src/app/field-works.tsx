import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import { FieldWorkLoadedDataCard } from '@/ui/shared/components/field-work-loaded-data-card';
import { useFieldWorkDataReadiness, type FieldWorkCardId } from '@/ui/shared/hooks/use-field-work-data';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, type RelativePathString } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ExpoRouterPath } from './_layout';

interface CardItem {
  id: FieldWorkCardId;
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
  {
    id: 'plantRegistration',
    title: 'Cadastro de plantas',
    subtitle: 'Adicione novas plantas pela posição atual',
    route: '/plant-registration' as ExpoRouterPath,
    icon: 'add-location-alt',
  },
];

export default function FieldWorks() {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const cardStates = useFieldWorkDataReadiness();

  const handlePress = (cardId: FieldWorkCardId, route: string | null) => {
    if (cardStates[cardId] === 'ready' && route) {
      router.push(route as RelativePathString);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <View style={styles.topEmptySpace}></View>

        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <FieldWorkLoadedDataCard />
          {cards.map((card) => {
            const state = cardStates[card.id];
            const isLoading = state === 'loading';
            const isReady = state === 'ready';

            return (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ busy: isLoading, disabled: !isReady }}
                activeOpacity={isReady ? 0.7 : 1}
                disabled={!isReady}
                key={card.id}
                onPress={isReady ? () => handlePress(card.id, card.route) : undefined}
                style={[
                  styles.card,
                  !isReady && styles.cardDisabled,
                  { backgroundColor: Colors[theme].card, borderColor: Colors[theme].cardBorder },
                ]}
                testID={`field-work-card-${card.id}`}
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
                {isLoading ? (
                  <ActivityIndicator
                    accessibilityLabel={`Carregando dados de ${card.title}`}
                    color={Colors[theme].tint}
                    size="small"
                  />
                ) : null}
                {state === 'unavailable' ? (
                  <View
                    accessible
                    accessibilityLabel={`${card.title} indisponível. Sem conexão ou dados necessários.`}
                    accessibilityRole="image"
                    style={styles.statusIcon}
                  >
                    <MaterialIcons name="cloud-off" size={24} color={Colors[theme].disabledText} />
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
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
  cardDisabled: {
    opacity: 0.58,
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
  statusIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  topEmptySpace: {
    height: 12,
  },
});
