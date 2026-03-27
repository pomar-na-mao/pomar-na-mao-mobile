import { useInspectRoutinesPlantsSyncDetailsStore } from '@/data/store/inspect-routines/use-inspect-routines-plants-sync-details-store';
import { ThemedView } from '@/shared/themes/themed-view';
import { useLocalSearchParams } from 'expo-router';
import { Dimensions, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SyncRoutineMainInfo from '../components/sync-routine-main-info';
import SyncRoutinePlantCard from '../components/sync-routine-plant-card';

const { width } = Dimensions.get('window');

export const InspectRoutinePlantsSyncDetailsView = () => {
  const { id } = useLocalSearchParams();

  const { inspectRoutinePlants } = useInspectRoutinesPlantsSyncDetailsStore();

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        {inspectRoutinePlants ? (
          <SyncRoutineMainInfo inspectRoutineId={id} numberOfPlants={inspectRoutinePlants.length} />
        ) : null}
        <FlatList
          horizontal
          pagingEnabled
          data={inspectRoutinePlants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <View style={{ width: width, paddingHorizontal: 16, alignItems: 'center' }}>
              <SyncRoutinePlantCard
                plantWithUpdates={item}
                currentIndex={index + 1}
                totalItems={inspectRoutinePlants?.length || 0}
                style={{ width: '100%', height: '100%', marginVertical: 0 }}
              />
            </View>
          )}
          contentContainerStyle={{
            marginTop: 10,
            paddingBottom: 20,
            flexGrow: 1,
            height: '100%',
          }}
          style={{ flex: 1 }}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </ThemedView>
    </SafeAreaView>
  );
};
