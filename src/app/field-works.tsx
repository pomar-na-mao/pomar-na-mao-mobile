import type { HorizontalTab } from '@/domain/models/shared/horizontal-tab.model';
import { fieldWorks } from '@/shared/constants/values';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import { InspectAnnotation } from '@/ui/inspect-annotation/components/inspect-annotation';
import { InspectAnnotationProvider } from '@/ui/inspect-annotation/view-models/useInspectAnnotation';
import { InspectRoutineList } from '@/ui/inspect-routines/components/inspect-routine-list';
import { InspectRoutineProvider } from '@/ui/inspect-routines/view-models/useInspectRoutine';
import HorizontalTabBar from '@/ui/shared/components/horizontal-tabbar';
import InDevelopmentTask from '@/ui/shared/components/in-development-task';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FieldWorks() {
  const [activeTab, setActiveTab] = useState(fieldWorks[0]);

  const onTabChangeHandler = (tab: HorizontalTab) => {
    setActiveTab(tab);
  };

  const getTabStyle = useCallback(
    (tabKey: string): ViewStyle =>
      activeTab.key === tabKey ? { flex: 1, display: 'flex' } : { flex: 0, display: 'none' },
    [activeTab.key],
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <ThemedText type="defaultSemiBold">Trabalhos em Campo</ThemedText>
            <ThemedText type="subtitle">Clique no item para visualizar</ThemedText>
          </View>
        </View>

        <HorizontalTabBar tabs={fieldWorks} onTabChange={onTabChangeHandler} />

        <ThemedView style={styles.contentContainer}>
          <View style={getTabStyle('inspect-routine')}>
            <InspectRoutineProvider>
              <InspectRoutineList />
            </InspectRoutineProvider>
          </View>

          <View style={getTabStyle('inspect-annotation')}>
            <InspectAnnotationProvider>
              <InspectAnnotation />
            </InspectAnnotationProvider>
          </View>

          <View style={getTabStyle('pulverization')}>
            <InDevelopmentTask />
          </View>

          <View style={getTabStyle('inspect-route')}>
            <InDevelopmentTask />
          </View>

          <View style={getTabStyle('harvest')}>
            <InDevelopmentTask />
          </View>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    width: '100%',
  },
  placeholderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  disabledTabItem: {
    opacity: 0.4,
  },
});
