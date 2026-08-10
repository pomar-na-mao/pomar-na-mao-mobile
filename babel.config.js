module.exports = function (api) {
  const platform = api.caller((caller) => (caller ? caller.platform : undefined));

  // Do not cache when platform-specific logic is applied
  api.cache.invalidate(() => platform);

  const plugins = [];

  if (platform === 'web') {
    // On web, alias 'react-native' to 'react-native-web' to prevent
    // native-only module errors (e.g. fb-batched-bridge-config-web).
    plugins.push([
      'module-resolver',
      {
        alias: {
          '^react-native$': 'react-native-web',
        },
      },
    ]);
  }

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
