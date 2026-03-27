import { useInspectRoutinesStore } from '@/data/store/inspect-routines/use-inspect-routines-store';
import { images } from '@/shared/constants/images';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { computeNumberOfOccurrences } from '@/utils/plant-data/compare';
import { formatDistance, updateDistanceBetweenUserAndNearestPlant } from '@/utils/plant-data/computations';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { NearestPlantModalData } from '../nearest-plant-modal-data';
import { styles } from './styles';

export const InspectRoutineNearestPlantCard = ({ location }: { location: Location.LocationObject }) => {
  const [showPlantDetails, setShowPlantDetails] = useState(false);

  const { nearestPlant, setIsDetecting } = useInspectRoutinesStore();

  const nearestPlantDistance = updateDistanceBetweenUserAndNearestPlant(nearestPlant, location);

  const theme = useColorScheme() ?? 'light';

  const showPlantDetailHandler = () => {
    setIsDetecting(false);
    setShowPlantDetails(true);
  };

  const closePlantDetailHandler = () => {
    setIsDetecting(true);
    setShowPlantDetails(false);
  };

  return (
    <View style={styles.container}>
      <NearestPlantModalData
        isDetailModalVisible={showPlantDetails}
        setIsDetailModalVisible={closePlantDetailHandler}
      />

      <View style={[styles.card, { backgroundColor: Colors[theme].card, borderColor: Colors[theme].cardBorder }]}>
        {/* Left Side */}
        <View style={styles.leftSideContainer}>
          <ThemedText type="default">
            Planta <Text style={{ color: Colors[theme].tint }}>#{nearestPlant?.id.split('-')[0]} ...</Text>
          </ThemedText>

          {/* Distance */}
          <View style={styles.infoContainer}>
            <View style={styles.distanceLogoContainer}>
              <MaterialCommunityIcons
                style={{ alignItems: 'center' }}
                name="map-marker-distance"
                size={34}
                color={Colors[theme].icon}
              />
            </View>

            <View style={styles.infoItemContainer}>
              <ThemedText type="subtitle">Distância</ThemedText>
              <Text style={{ color: Colors[theme].tint }}>
                {nearestPlantDistance ? formatDistance(nearestPlantDistance) : '---'}
              </Text>
            </View>
          </View>

          {/* Occurrences */}
          <View style={styles.infoContainer}>
            <Image source={images.alivePlant} style={{ width: 50, height: 50 }} />
            <View style={styles.infoItemContainer}>
              <ThemedText type="subtitle">Ocorrências</ThemedText>
              <Text style={{ color: Colors[theme].tint }}>
                {nearestPlant ? computeNumberOfOccurrences(nearestPlant) : '---'}
              </Text>
            </View>
          </View>
        </View>

        {/* Right Side */}
        <View style={{ width: '30%' }}>
          <TouchableOpacity
            style={[styles.detailButton, { backgroundColor: Colors[theme].tint }]}
            onPress={() => showPlantDetailHandler()}
          >
            <MaterialCommunityIcons name="pencil-outline" size={26} color={Colors[theme].background} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
