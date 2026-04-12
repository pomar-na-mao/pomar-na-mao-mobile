import { Redirect } from 'expo-router';
import type { ExpoRouterPath } from './_layout';

if (__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../../ReactotronConfig.js');
}

export default function Index() {
  const redirectRouter = '/field-works' as ExpoRouterPath;
  return <Redirect href={redirectRouter} />;
}
