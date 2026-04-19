import 'dotenv/config';

export default {
  expo: {
    name: 'Pomar na mão',
    slug: 'pomar-na-mao-mobile',
    version: '1.0.1',
    orientation: 'portrait',
    icon: './src/assets/images/icon.png',
    scheme: 'pomarnamaomobile',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#FFFFFF',
        foregroundImage: './src/assets/images/android-icon-foreground.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
      package: 'com.lspeixoto.pomarnamaomobile',
    },
    web: {
      output: 'static',
      favicon: './src/assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-sqlite',
      'expo-font',
      '@react-native-community/datetimepicker',
      [
        'expo-splash-screen',
        {
          image: './src/assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#FFFFFF',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: 'ec77890b-4855-4037-9d22-e3764cad6e0b',
      },
    },
  },
};
