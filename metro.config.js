const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support WASM files for expo-sqlite on web
config.resolver.assetExts.push('wasm');

// Paths to stub files for native-only react-native modules
const TURBO_MODULE_STUB = path.resolve(__dirname, 'src/shared/stubs/react-native-turbo-module-stub.js');
const NATIVE_MODULES_STUB = path.resolve(__dirname, 'src/shared/stubs/react-native-native-modules-stub.js');
const MAPS_WEB_STUB = path.resolve(__dirname, 'src/shared/components/react-native-maps-web.tsx');

// react-native root module directory
const REACT_NATIVE_DIR = path.resolve(__dirname, 'node_modules/react-native');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    const originPath = context.originModulePath || '';
    const isFromReactNative = originPath.includes(REACT_NATIVE_DIR);

    // Redirect root 'react-native' import to react-native-web
    if (moduleName === 'react-native') {
      return context.resolveRequest(
        { ...context, resolveRequest: undefined },
        'react-native-web',
        platform
      );
    }

    // Redirect react-native-maps to web stub
    if (moduleName === 'react-native-maps') {
      return { filePath: MAPS_WEB_STUB, type: 'sourceFile' };
    }

    // Stub TurboModuleRegistry when imported by name or by relative path from within react-native
    if (
      moduleName === 'react-native/Libraries/TurboModule/TurboModuleRegistry' ||
      (isFromReactNative && moduleName.includes('TurboModule/TurboModuleRegistry'))
    ) {
      return { filePath: TURBO_MODULE_STUB, type: 'sourceFile' };
    }

    // Stub BatchedBridge/NativeModules when imported by name or by relative path from within react-native
    if (
      moduleName === 'react-native/Libraries/BatchedBridge/NativeModules' ||
      (isFromReactNative && moduleName.includes('BatchedBridge/NativeModules'))
    ) {
      return { filePath: NATIVE_MODULES_STUB, type: 'sourceFile' };
    }
  }

  // Chain to Metro's default resolver
  return context.resolveRequest({ ...context, resolveRequest: undefined }, moduleName, platform);
};

// Set COOP/COEP headers required by SharedArrayBuffer used in expo-sqlite wasm
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
