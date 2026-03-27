import { useInspectRoutinesStore } from '@/data/store/inspect-routines/use-inspect-routines-store';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import { InspectRoutineDetail } from '@/ui/inspect-routines/components/inspect-routine-detail';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const InspectRoutineInActionDetectionView = () => {
  const { id } = useLocalSearchParams();

  const { selectedInspection } = useInspectRoutinesStore((state) => state);

  const theme = useColorScheme() ?? 'light';

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <ThemedText type="title">
              Inspeção{' '}
              <ThemedText type="title" style={{ color: Colors[theme].tint }}>
                #{id}
              </ThemedText>{' '}
            </ThemedText>
            <ThemedText type="subtitle">Caminhe e visualize sempre a planta mais próxima</ThemedText>
          </View>
        </View>

        {selectedInspection ? <InspectRoutineDetail /> : null}
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 18,
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 18,
    width: '100%',
  },
  scrollViewArea: {
    flexGrow: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  infoAreaContainer: { padding: 10 },
  logoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
  },
});
