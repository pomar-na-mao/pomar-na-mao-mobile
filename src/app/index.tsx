import { LoadingOverlay } from '@/ui/shared/components/LoadingOverlay';
import { View } from 'react-native';

if (__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../../ReactotronConfig.js');
}

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <LoadingOverlay />
    </View>
  );
}
