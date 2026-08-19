import type { LocalPlantRegistration } from '@/domain/models/plant-registration';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { PlantRegistrationCard } from '@/ui/plant-registration/components/plant-registration-card';
import { PlantRegistrationModal } from '@/ui/plant-registration/components/plant-registration-modal';
import { usePlantRegistration } from '@/ui/plant-registration/view-models/use-plant-registration';
import { ConfirmationModal } from '@/ui/shared/components/confirmation-modal';
import { FieldWorkHeader } from '@/ui/shared/components/field-work-header';
import { MaterialIcons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

const deleteAllMessage =
  'Excluir todas as plantas desta lista do dispositivo? ' + 'Plantas sincronizadas não serão removidas do servidor.';

export function PlantRegistrationScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { deleteAllPlants, deletePlant, isSyncingAll, openModal, plants, syncAllPlants, syncPlant } =
    usePlantRegistration();
  const networkState = Network.useNetworkState();
  const isOnline = networkState.isConnected === true && networkState.isInternetReachable === true;
  const [plantToDelete, setPlantToDelete] = useState<LocalPlantRegistration | null>(null);
  const [isDeleteAllVisible, setDeleteAllVisible] = useState(false);
  const hasPendingPlants = plants.some(
    (plant) => plant.sync_status === 'pending_create' || plant.sync_status === 'error',
  );
  const canSyncAll = isOnline && hasPendingPlants && !isSyncingAll;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FieldWorkHeader
        backAccessibilityLabel="Voltar para trabalhos de campo"
        onBackPress={() => router.back()}
        subtitle={`${plants.length} ${plants.length === 1 ? 'planta local' : 'plantas locais'}`}
        title="Cadastro de plantas"
      />

      <FlatList
        contentContainerStyle={[styles.listContent, plants.length === 0 && styles.emptyListContent]}
        data={plants}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.logoBackground }]}>
              <MaterialIcons color={colors.tint} name="eco" size={42} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma planta adicionada</Text>
            <Text style={[styles.emptySubtitle, { color: colors.disabledText }]}>
              As plantas salvas neste dispositivo aparecerão aqui para sincronização.
            </Text>
            <Pressable
              accessibilityLabel="Adicionar primeira planta"
              accessibilityRole="button"
              onPress={openModal}
              style={[styles.emptyButton, { backgroundColor: colors.tint }]}
            >
              <MaterialIcons color="#FFFFFF" name="add-location-alt" size={21} />
              <Text style={styles.primaryText}>Adicionar planta</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <PlantRegistrationCard
            isOnline={isOnline && !isSyncingAll}
            onDelete={setPlantToDelete}
            onSync={(id) => void syncPlant(id)}
            plant={item}
          />
        )}
        showsVerticalScrollIndicator={false}
        testID="plant-registration-list"
      />

      {plants.length > 0 ? (
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.cardBorder }]}>
          <View style={styles.bulkActions}>
            <Pressable
              accessibilityLabel="Excluir todas as plantas da lista"
              accessibilityRole="button"
              accessibilityState={{ disabled: isSyncingAll }}
              disabled={isSyncingAll}
              onPress={() => setDeleteAllVisible(true)}
              style={[styles.bulkButton, { borderColor: colors.cardBorder, opacity: isSyncingAll ? 0.5 : 1 }]}
              testID="plant-registration-delete-all-button"
            >
              <MaterialIcons color={colors.danger} name="delete-sweep" size={20} />
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                numberOfLines={1}
                style={[styles.bulkButtonText, { color: colors.danger }]}
              >
                Excluir todas
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Sincronizar todas as plantas pendentes"
              accessibilityRole="button"
              accessibilityState={{ busy: isSyncingAll, disabled: !canSyncAll }}
              disabled={!canSyncAll}
              onPress={() => void syncAllPlants()}
              style={[styles.bulkButton, { borderColor: colors.cardBorder, opacity: canSyncAll ? 1 : 0.5 }]}
              testID="plant-registration-sync-all-button"
            >
              {isSyncingAll ? (
                <ActivityIndicator color={colors.tint} size="small" />
              ) : (
                <MaterialIcons color={colors.tint} name="sync" size={20} />
              )}
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                numberOfLines={1}
                style={[styles.bulkButtonText, { color: colors.tint }]}
              >
                Sincronizar todas
              </Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityLabel="Adicionar nova planta"
            accessibilityRole="button"
            onPress={openModal}
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            testID="plant-registration-add-button"
          >
            <MaterialIcons color="#FFFFFF" name="add-location-alt" size={22} />
            <Text style={styles.primaryText}>Adicionar planta</Text>
          </Pressable>
        </View>
      ) : null}

      <ConfirmationModal
        message="Excluir esta planta do dispositivo? A planta sincronizada não será removida!"
        onCancel={() => setPlantToDelete(null)}
        onConfirm={() => {
          if (plantToDelete) void deletePlant(plantToDelete.id);
          setPlantToDelete(null);
        }}
        title="Excluir planta local?"
        visible={plantToDelete !== null}
      />
      <ConfirmationModal
        message={deleteAllMessage}
        onCancel={() => setDeleteAllVisible(false)}
        onConfirm={() => {
          setDeleteAllVisible(false);
          void deleteAllPlants();
        }}
        title="Excluir todas as plantas?"
        visible={isDeleteAllVisible}
      />
      <PlantRegistrationModal />
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 20,
  },
  container: { flex: 1 },
  bulkActions: { flexDirection: 'row', gap: 10 },
  bulkButton: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 8,
  },
  bulkButtonText: { fontSize: 13, fontWeight: '800' },
  emptyButton: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 52,
    paddingHorizontal: 22,
  },
  emptyIcon: { alignItems: 'center', borderRadius: 42, height: 84, justifyContent: 'center', width: 84 },
  emptyListContent: { flexGrow: 1 },
  emptyState: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  emptySubtitle: { fontSize: 16, lineHeight: 24, marginBottom: 10, maxWidth: 330, textAlign: 'center' },
  emptyTitle: { fontSize: 21, fontWeight: '800', marginBottom: 8, marginTop: 18, textAlign: 'center' },
  footer: { borderTopWidth: 1, gap: 10, padding: 16 },
  listContent: { gap: 14, padding: 16, paddingBottom: 24 },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
