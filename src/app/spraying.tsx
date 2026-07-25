import { ThemedView } from '@/shared/themes/themed-view';
import { SprayingListScreen } from '@/ui/spraying/components/spraying-list-screen';
import { SprayingScreen } from '@/ui/spraying/components/spraying-screen';
import { SprayingProvider, useSpraying } from '@/ui/spraying/view-models/use-spraying';
import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function SprayingMainContent() {
  const { activeView, openListView } = useSpraying();

  useEffect(() => {
    const onBackPress = () => {
      if (activeView === 'map') {
        openListView();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [activeView, openListView]);

  return activeView === 'map' ? <SprayingScreen /> : <SprayingListScreen />;
}

export default function SprayingRoute() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <SprayingProvider>
          <SprayingMainContent />
        </SprayingProvider>
      </SafeAreaView>
    </ThemedView>
  );
}
