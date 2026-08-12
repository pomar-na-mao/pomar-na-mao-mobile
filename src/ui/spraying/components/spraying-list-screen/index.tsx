import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ConfirmationModal } from '@/ui/shared/components/confirmation-modal';
import { FieldWorkHeader } from '@/ui/shared/components/field-work-header';
import { useSpraying } from '@/ui/spraying/view-models/use-spraying';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SprayingOperationCard } from './spraying-operation-card';

export function SprayingListScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { operationsList, openMapView, syncOperationById, deleteOperationById } = useSpraying();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FieldWorkHeader
        backAccessibilityLabel="Voltar para Trabalhos de Campo"
        backButtonTestID="back-to-field-works-btn"
        onBackPress={() => router.back()}
        title="Pulverizações"
      />

      <FlatList
        data={operationsList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SprayingOperationCard
            item={item}
            colors={colors}
            onOpenMap={(id) => void openMapView(id)}
            onSync={(id) => void syncOperationById(id)}
            onDeleteRequest={setDeletingId}
          />
        )}
        contentContainerStyle={operationsList.length === 0 ? styles.listContentEmpty : styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBg, { backgroundColor: colors.card }]}>
              <MaterialIcons name="agriculture" size={48} color={colors.disabledText} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma pulverização</Text>
            <Text style={[styles.emptySubtitle, { color: colors.disabledText }]}>
              Toque no botão abaixo para iniciar uma nova pulverização
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void openMapView()}
              style={[styles.emptyBtn, { backgroundColor: colors.tint }]}
              testID="empty-new-spraying-btn"
            >
              <MaterialIcons name="play-arrow" color="#FFFFFF" size={20} />
              <Text style={styles.newBtnText}>Iniciar Nova Pulverização</Text>
            </Pressable>
          </View>
        }
      />

      <ConfirmationModal
        visible={Boolean(deletingId)}
        title="Excluir Pulverização"
        message="Deseja apagar esta operação e todos os dados locais associados?"
        onCancel={() => setDeletingId(null)}
        onConfirm={async () => {
          if (deletingId) {
            await deleteOperationById(deletingId);
            setDeletingId(null);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyBtn: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    height: 48,
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconBg: {
    alignItems: 'center',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 16,
    width: 80,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  newBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
