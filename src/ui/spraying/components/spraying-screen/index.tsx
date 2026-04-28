import { Colors } from '@/shared/constants/theme';
import React, { useState } from 'react';
import { Modal, StyleSheet, View, useColorScheme } from 'react-native';
import { SprayingActions } from '../spraying-actions';
import { SprayingFilterModal } from '../spraying-filter-modal';
import { SprayingMap } from '../spraying-map';
import { SprayingProductsModal } from '../spraying-products-modal';

export function SprayingScreen() {
  const theme = useColorScheme() ?? 'light';
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isProductsVisible, setIsProductsVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      {/* Mapa como fundo principal */}
      <SprayingMap />

      {/* Barra de ações flutuante */}
      <SprayingActions
        onOpenFilters={() => setIsFilterVisible(true)}
        onOpenProducts={() => setIsProductsVisible(true)}
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
