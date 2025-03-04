module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Remove any references to nativewind/babel
    plugins: [
      'expo-router/babel',
      'react-native-reanimated/plugin',
    ],
  };
};
