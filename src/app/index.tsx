import { Redirect } from 'expo-router';
import type { ExpoRouterPath } from './_layout';

import { Platform } from 'react-native';

if (__DEV__ && Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../../ReactotronConfig.js');
}

export default function Index() {
  const redirectRouter = '/field-works' as ExpoRouterPath;
  return <Redirect href={redirectRouter} />;
}
