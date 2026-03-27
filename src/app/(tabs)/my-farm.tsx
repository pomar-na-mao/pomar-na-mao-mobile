import { MyFarmView } from '@/ui/my-farm/components/my-farm-view';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyFarm() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <MyFarmView />
    </SafeAreaView>
  );
}
