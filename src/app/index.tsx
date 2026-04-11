import { Redirect } from 'expo-router';

if (__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('../../ReactotronConfig.js');
}

export default function Index() {
  return <Redirect href="/field-works" />;
}
