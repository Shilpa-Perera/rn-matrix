// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');


/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules['react-native-matrix-sdk'] = path.resolve(__dirname, '../react-native-matrix-sdk');
config.watchFolders.push(path.resolve(__dirname, '../react-native-matrix-sdk'));

module.exports = config;
