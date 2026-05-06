import { useSprayingStore } from '@/data/store/spraying/use-spraying-store';
import { Colors } from '@/shared/constants/theme';
import { useTrackingTimer } from '@/shared/hooks/use-tracking-timer';
import { useSpraying } from '@/ui/spraying/view-models/use-spraying';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

interface SprayingActionsProps {
  onOpenFilters: () => void;
  onOpenProducts: () => void;
  onFinishSession?: () => void;
}

export const SprayingActions: React.FC<SprayingActionsProps> = ({ onOpenFilters, onOpenProducts, onFinishSession }) => {
  const theme = useColorScheme() ?? 'light';

  const activeSession = useSprayingStore((state) => state.activeSession);
  const isTracking = useSprayingStore((state) => state.isTracking);
  const {
    handleStartTracking,
    handleStopTracking,
    handleFinishSession,
    handleDeleteSession,
    plantsData,
    isReviewMode,
    handleEnterReviewMode,
    handleCancelReview,
    handleConfirmReview,
  } = useSpraying();

  const hasPlantsLoaded = plantsData.length > 0;
  const trackingTimer = useTrackingTimer();

  return (
    <View style={styles.dockContainer}>
      {/* Timer de gravação flutuante */}
      {isTracking && trackingTimer !== null && (
        <View style={styles.timerBadge}>
          <MaterialIcons name="radio-button-on" size={10} color="#EF4444" style={styles.timerDot} />
          <Text style={styles.timerText}>{trackingTimer}</Text>
        </View>
      )}
      <View
        style={[
          styles.pillBar,
          {
            backgroundColor: theme === 'dark' ? 'rgba(28, 29, 28, 0.92)' : 'rgba(255, 255, 255, 0.92)',
          },
        ]}
      >
        {/* Botão de Configuração/Filtros – escondido no modo revisão */}
        {!isReviewMode && (
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: Colors[theme].line }]}
            onPress={onOpenFilters}
          >
            <MaterialIcons name="settings" size={24} color={Colors[theme].tint} />
          </TouchableOpacity>
        )}

        {/* Botão Principal Dinâmico */}
        {!activeSession ? (
          hasPlantsLoaded ? (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: Colors[theme].tint }]}
              onPress={onOpenProducts}
            >
              <MaterialIcons name="play-arrow" size={24} color="#FFF" />
              <Text style={styles.primaryButtonText}>Iniciar Sessão</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.primaryButton, { backgroundColor: Colors[theme].grey }]}>
              <Text style={[styles.primaryButtonText, { color: Colors[theme].disabledText }]}>Carregue as plantas</Text>
            </View>
          )
        ) : activeSession.status === 'in_progress' ? (
          <>
            {!isTracking ? (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: Colors[theme].tint }]}
                onPress={handleStartTracking}
              >
                <MaterialIcons name="gps-fixed" size={24} color="#FFF" />
                <Text style={styles.primaryButtonText}>Gravar Rota</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: Colors[theme].danger }]}
                onPress={handleStopTracking}
              >
                <MaterialIcons name="gps-off" size={24} color="#FFF" />
                <Text style={styles.primaryButtonText}>Parar Gravação</Text>
              </TouchableOpacity>
            )}

            {/* Botão de Reset (Excluir) */}
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: Colors[theme].line }]}
              onPress={() => handleDeleteSession(activeSession.id)}
            >
              <MaterialIcons name="delete-outline" size={24} color={Colors[theme].danger} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: Colors[theme].line }]}
              onPress={async () => {
                await handleFinishSession();
                onFinishSession?.();
              }}
            >
              <MaterialIcons name="stop" size={24} color={Colors[theme].danger} />
            </TouchableOpacity>
          </>
        ) : isReviewMode ? (
          /* ── MODO REVISÃO ── */
          <>
            {/* Cancelar revisão */}
            <TouchableOpacity
              style={[styles.secondaryWideButton, { borderColor: Colors[theme].danger }]}
              onPress={handleCancelReview}
            >
              <MaterialIcons name="close" size={22} color={Colors[theme].danger} />
              <Text style={[styles.secondaryButtonText, { color: Colors[theme].danger }]}>Cancelar</Text>
            </TouchableOpacity>

            {/* Confirmar e sincronizar */}
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: Colors[theme].confirmationButtonBackground }]}
              onPress={() => handleConfirmReview()}
            >
              <MaterialIcons name="check-circle" size={24} color="#FFF" />
              <Text style={styles.primaryButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* ── SESSÃO FINALIZADA (normal) ── */
          <>
            {/* Entrar em modo de revisão */}
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: Colors[theme].confirmationButtonBackground }]}
              onPress={() => handleEnterReviewMode()}
            >
              <MaterialIcons name="sync" size={24} color="#FFF" />
              <Text style={styles.primaryButtonText}>Sincronizar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: Colors[theme].line }]}
              onPress={() => handleDeleteSession(activeSession.id)}
            >
              <MaterialIcons name="delete-outline" size={24} color={Colors[theme].danger} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockContainer: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  pillBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    gap: 8,
    width: '100%',
    maxWidth: 500,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 26,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryWideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 26,
    borderWidth: 1.5,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.82)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 8,
    gap: 5,
  },
  timerDot: {
    // slight pulse feel via opacity; full animation would need Animated API
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
});
