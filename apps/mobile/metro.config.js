const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [
  path.resolve(workspaceRoot, "packages/shared"),
  path.resolve(workspaceRoot, "packages/i18n"),
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Keep hierarchical lookup so Expo/Metro can resolve hoisted workspace deps
config.resolver.disableHierarchicalLookup = false;

config.resolver.extraNodeModules = {
  "@deepmatch/shared": path.resolve(workspaceRoot, "packages/shared"),
  "@deepmatch/i18n": path.resolve(workspaceRoot, "packages/i18n"),
};

module.exports = config;
