import { useSprayingStore } from '@/data/store/spraying/use-spraying-store';
import { Colors } from '@/shared/constants/theme';
import { SprayingReviewLegend } from '@/ui/spraying/components/spraying-review-legend';
import { useSpraying } from '@/ui/spraying/view-models/use-spraying';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View, useColorScheme } from 'react-native';
import { SprayingActions } from '../spraying-actions';
import { SprayingFilterModal } from '../spraying-filter-modal';
import { SprayingMap } from '../spraying-map';
import { SprayingProductsModal } from '../spraying-products-modal';
import { SprayingSessionsList } from '../spraying-sessions-list';

export function SprayingScreen() {
  const theme = useColorScheme() ?? 'light';
  const activeSession = useSprayingStore((state) => state.activeSession);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isProductsVisible, setIsProductsVisible] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const { isReviewMode, reviewPreviewIds, reviewFinalIds } = useSpraying();

  useEffect(() => {
    if (activeSession?.status === 'in_progress') {
      setIsRegistering(true);
    }
  }, [activeSession]);

  if (!isRegistering) {
    return <SprayingSessionsList onStartNewSession={() => setIsRegistering(true)} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      {/* Mapa como fundo principal */}
      <SprayingMap />

      {/* Legenda flutuante no modo revisão */}
      {isReviewMode && (
        <SprayingReviewLegend preSelectedCount={reviewPreviewIds.size} finalCount={reviewFinalIds.size} />
      )}

      {/* Barra de ações flutuante */}
      <SprayingActions
        onOpenFilters={() => setIsFilterVisible(true)}
        onOpenProducts={() => setIsProductsVisible(true)}
        onFinishSession={() => setIsRegistering(false)}
      />

      {/* Modal de Filtros (Configuração) */}
      <Modal visible={isFilterVisible} animationType="slide" onRequestClose={() => setIsFilterVisible(false)}>
        <SprayingFilterModal closeMenu={() => setIsFilterVisible(false)} />
      </Modal>

      <Modal visible={isProductsVisible} animationType="slide" onRequestClose={() => setIsProductsVisible(false)}>
        <SprayingProductsModal closeMenu={() => setIsProductsVisible(false)} />
      </Modal>

      {/* 
        TODO: Poderíamos adicionar uma pequena legenda ou card flutuante no topo 
        mostrando detalhes da sessão ativa (operador, tempo, etc)
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
