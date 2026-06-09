import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { useSpraying } from '@/ui/spraying/view-models/use-spraying';
import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export function SprayingReviewModal() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { aggregate, closeReview, confirmReview, isReviewVisible, togglePlant } = useSpraying();

  return (
    <Modal visible={isReviewVisible} animationType="slide" onRequestClose={closeReview}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Revisar plantas atingidas</Text>
        <Text style={[styles.subtitle, { color: colors.disabledText }]}>
          Verdes e azuis serao sincronizadas. Toque em uma planta para adicionar ou remover.
        </Text>

        <FlatList
          data={aggregate?.plants ?? []}
          keyExtractor={(plant) => plant.plantId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const selected = ['confirmed', 'manually_added'].includes(item.reviewStatus ?? '');
            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() => void togglePlant(item)}
                style={[
                  styles.plantRow,
                  {
                    backgroundColor: selected ? colors.activeTrackColor : colors.card,
                    borderColor: selected ? colors.tint : colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.plantText}>
                  <Text style={[styles.plantTitle, { color: colors.text }]}>
                    {item.varietyName ?? `Planta ${item.plantId.slice(0, 8)}`}
                  </Text>
                  <Text style={[styles.plantSubtitle, { color: colors.disabledText }]}>
                    {item.distanceMeters == null ? 'Adicao manual' : `${item.distanceMeters.toFixed(2)} m da rota`}
                  </Text>
                </View>
                <Text style={{ color: selected ? colors.tint : colors.disabledText, fontWeight: '800' }}>
                  {selected ? 'Incluida' : item.reviewStatus === 'removed' ? 'Removida' : 'Fora'}
                </Text>
              </Pressable>
            );
          }}
        />

        <View style={styles.actions}>
          <Pressable onPress={closeReview} style={[styles.action, { backgroundColor: colors.cancelButtonBackground }]}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>Voltar</Text>
          </Pressable>
          <Pressable
            onPress={() => void confirmReview()}
            style={[styles.action, { backgroundColor: colors.confirmationButtonBackground }]}
          >
            <Text style={styles.whiteText}>Confirmar revisão</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 50,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
  },
  container: {
    flex: 1,
    paddingTop: 56,
  },
  list: {
    gap: 8,
    padding: 16,
  },
  plantRow: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  plantSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },
  plantText: {
    flex: 1,
  },
  plantTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    paddingHorizontal: 16,
  },
  whiteText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
