const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  port: 8086,
};

module.exports = config;
