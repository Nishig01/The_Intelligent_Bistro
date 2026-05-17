module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      'babel-plugin-transform-import-meta',
      ['babel-plugin-transform-define', {
        'import.meta.env': { MODE: 'development' }
      }]
    ],
  };
};
