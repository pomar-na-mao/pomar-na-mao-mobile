import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import type {
  SprayingSimulationPointIndex,
  SprayingSimulationPoints,
} from '@/ui/spraying/helpers/spraying-route-simulation';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface SprayingRouteSimulationProps {
  canUseSimulation: boolean;
  isRunning: boolean;
  onClear(): void;
  onSelectPoint(index: SprayingSimulationPointIndex): void;
  onStart(): void;
  onStop(): void;
  points: SprayingSimulationPoints;
  selectedPointIndex: SprayingSimulationPointIndex | null;
}

export const SprayingRouteSimulation = ({
  canUseSimulation,
  isRunning,
  onClear,
  onSelectPoint,
  onStart,
  onStop,
  points,
  selectedPointIndex,
}: SprayingRouteSimulationProps) => {
  const theme = useColorScheme() ?? 'light';
  const canStart = canUseSimulation && points.every(Boolean) && !isRunning;
  const selectedPointLabel = selectedPointIndex === null ? null : `P${selectedPointIndex + 1}`;

  if (!__DEV__) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[theme].surface,
          borderColor: Colors[theme].cardBorder,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.statusText, { color: Colors[theme].text }]}>
          {!canUseSimulation
            ? 'Inicie a pulverização para simular a rota'
            : selectedPointLabel
              ? `Toque no mapa para marcar ${selectedPointLabel}`
              : 'Selecione P1 ou P2'}
        </Text>

        <View style={styles.pointControls}>
          {points.map((point, index) => {
            const pointIndex = index as SprayingSimulationPointIndex;
            const isSelected = selectedPointIndex === pointIndex;
            const hasPoint = Boolean(point);

            return (
              <Pressable
                accessibilityLabel={`Marcar P${pointIndex + 1}`}
                accessibilityRole="button"
                disabled={isRunning || !canUseSimulation}
                key={pointIndex}
                onPress={() => onSelectPoint(pointIndex)}
                style={[
                  styles.pointButton,
                  {
                    backgroundColor: isSelected ? Colors[theme].tint : Colors[theme].neutralButtonBackground,
                    borderColor: hasPoint ? Colors[theme].confirmationButtonBackground : Colors[theme].inputBorder,
                    opacity: isRunning || !canUseSimulation ? 0.55 : 1,
                  },
                ]}
              >
                <MaterialIcons
                  color={isSelected ? Colors[theme].background : Colors[theme].text}
                  name={hasPoint ? 'place' : 'add-location-alt'}
                  size={16}
                />
                <Text
                  style={[styles.pointLabel, { color: isSelected ? Colors[theme].background : Colors[theme].text }]}
                >
                  P{pointIndex + 1}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.actionControls}>
        <Pressable
          accessibilityLabel="Iniciar simulacao de rota"
          accessibilityRole="button"
          disabled={!canStart}
          onPress={onStart}
          style={[
            styles.actionButton,
            {
              backgroundColor: canStart ? Colors[theme].confirmationButtonBackground : Colors[theme].disabledText,
            },
          ]}
        >
          <MaterialIcons color="#FFFFFF" name="play-arrow" size={22} />
        </Pressable>

        <Pressable
          accessibilityLabel="Parar simulacao de rota"
          accessibilityRole="button"
          disabled={!isRunning}
          onPress={onStop}
          style={[
            styles.actionButton,
            {
              backgroundColor: isRunning ? Colors[theme].warning : Colors[theme].disabledText,
            },
          ]}
        >
          <MaterialIcons color="#FFFFFF" name="stop" size={22} />
        </Pressable>

        <Pressable
          accessibilityLabel="Limpar simulacao de rota"
          accessibilityRole="button"
          disabled={isRunning}
          onPress={onClear}
          style={[
            styles.actionButton,
            {
              backgroundColor: isRunning ? Colors[theme].disabledText : Colors[theme].neutralButtonBackground,
              borderColor: Colors[theme].inputBorder,
              borderWidth: 1,
            },
          ]}
        >
          <MaterialIcons color={Colors[theme].text} name="delete-outline" size={22} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 44,
  },
  actionControls: {
    flexDirection: 'row',
    gap: 8,
  },
  container: {
    alignItems: 'flex-end',
    borderRadius: 8,
    borderWidth: 1,
    bottom: 92,
    elevation: 5,
    flexDirection: 'row',
    gap: 10,
    left: 12,
    padding: 10,
    position: 'absolute',
    right: 12,
    shadowColor: '#000000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    zIndex: 20,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  pointButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 2,
    height: 40,
    justifyContent: 'center',
    width: 50,
  },
  pointLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  pointControls: {
    flexDirection: 'row',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});
