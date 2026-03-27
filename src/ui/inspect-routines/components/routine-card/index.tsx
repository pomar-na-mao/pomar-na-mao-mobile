import type { PlantData } from '@/domain/models/shared/plant-data.model';
import { images } from '@/shared/constants/images';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { formatDateToShortLabel } from '@/utils/date/dates';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { styles } from './styles';

interface RoutineCardProps {
  id: number;
  date: string;
  region: string;
  plantDatas: string | PlantData[];
  routineName?: string;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({ id, date, region, plantDatas, routineName }) => {
  const totalOfPlants = JSON.parse(plantDatas as string)?.length;

  const totalOfUpdatedPlants = JSON.parse(plantDatas as string)?.filter(
    (item: PlantData) => item.wasUpdated === true,
  ).length;

  const theme = useColorScheme() ?? 'light';

  return (
    <View style={[styles.card, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].cardBorder }]}>
      {/* Left Side */}
      <View style={styles.leftSideContainer}>
        <View style={styles.leftSideItem}>
          <Image source={images.alivePlant} style={styles.treeImage} />

          <View>
            <ThemedText type="default">Total de plantas</ThemedText>
            <Text style={{ color: Colors[theme].tint }}>{totalOfPlants}</Text>
          </View>
        </View>

        <View style={styles.leftSideItem}>
          <Image source={images.alivePlant} style={styles.treeImage} />

          <View>
            <ThemedText type="default">Plantas alteradas</ThemedText>
            <Text style={{ color: Colors[theme].tint }}>{totalOfUpdatedPlants}</Text>
          </View>
        </View>
      </View>

      {/* Right Side */}
      <View style={styles.rightSideContainer}>
        <View style={styles.rightSideTopInfoContainer}>
          <ThemedText type="subtitle">{formatDateToShortLabel(date)}</ThemedText>
          <Text style={[styles.zoneText, { color: Colors[theme].confirmationButtonBackground }]}>Zona {region}</Text>
        </View>

        <View style={[styles.routineCircle, { backgroundColor: Colors[theme].secondary }]}>
          <ThemedText type="defaultSemiBold">#{id}</ThemedText>
        </View>
      </View>
    </View>
  );
};
