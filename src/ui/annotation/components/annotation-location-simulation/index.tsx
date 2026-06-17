import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AnnotationLocationSimulationProps {
  hasPoint: boolean;
  isSelectingPoint: boolean;
  onClear(): void;
  onSelectPoint(): void;
}

export const AnnotationLocationSimulation = ({
  hasPoint,
  isSelectingPoint,
  onClear,
  onSelectPoint,
}: AnnotationLocationSimulationProps) => {
  const theme = useColorScheme() ?? 'light';

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
          {isSelectingPoint
            ? 'Toque no mapa para definir a localização'
            : hasPoint
              ? 'Localização DEV ativa'
              : 'Defina uma localização DEV'}
        </Text>

        <Pressable
          accessibilityLabel={hasPoint ? 'Alterar localização DEV' : 'Marcar localização DEV'}
          accessibilityRole="button"
          onPress={onSelectPoint}
          style={[
            styles.pointButton,
            {
              backgroundColor: isSelectingPoint ? Colors[theme].tint : Colors[theme].neutralButtonBackground,
              borderColor: hasPoint ? Colors[theme].confirmationButtonBackground : Colors[theme].inputBorder,
            },
          ]}
        >
          <MaterialIcons
            color={isSelectingPoint ? Colors[theme].background : Colors[theme].text}
            name={hasPoint ? 'place' : 'add-location-alt'}
            size={18}
          />
          <Text
            style={[styles.pointLabel, { color: isSelectingPoint ? Colors[theme].background : Colors[theme].text }]}
          >
            {hasPoint ? 'Alterar ponto' : 'Marcar ponto'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.actionControls}>
        <Pressable
          accessibilityLabel="Excluir localização DEV"
          accessibilityRole="button"
          disabled={!hasPoint}
          onPress={onClear}
          style={[
            styles.actionButton,
            {
              backgroundColor: hasPoint ? Colors[theme].neutralButtonBackground : Colors[theme].disabledText,
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
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 6,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  pointLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});
