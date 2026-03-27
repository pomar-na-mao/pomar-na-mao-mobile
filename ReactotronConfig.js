import AsyncStorage from '@react-native-async-storage/async-storage';
import Reactotron, { trackGlobalErrors } from 'reactotron-react-native';

if (__DEV__) {
  const reactotron = Reactotron.setAsyncStorageHandler(AsyncStorage)
    .configure({ name: 'Pomar na mão' })
    .useReactNative({
      asyncStorage: true,
      networking: {
        ignoreUrls: /symbolicate/,
      },
    })
    .use(trackGlobalErrors())
    .connect();

  console.tron = reactotron;
}
