const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

function resolveExisting(...candidates) {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

// Single React copy — dual React (mobile 19.2.3 + root 19.3.0) causes
// "Invalid hook call" / "Cannot read property 'useState' of null" in Expo Go.
const reactRoot = resolveExisting(
  path.resolve(projectRoot, "node_modules/react"),
  path.resolve(workspaceRoot, "node_modules/react"),
);
const reactDomRoot = resolveExisting(
  path.resolve(projectRoot, "node_modules/react-dom"),
  path.resolve(workspaceRoot, "node_modules/react-dom"),
);
const reactNativeRoot = resolveExisting(
  path.resolve(projectRoot, "node_modules/react-native"),
  path.resolve(workspaceRoot, "node_modules/react-native"),
);

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

// Prefer project then workspace; keep hierarchical lookup for Expo deps.
config.resolver.disableHierarchicalLookup = false;

config.resolver.extraNodeModules = {
  "@deepmatch/shared": path.resolve(workspaceRoot, "packages/shared"),
  "@deepmatch/i18n": path.resolve(workspaceRoot, "packages/i18n"),
  // Force one React copy (root is pinned to 19.2.3 via package.json overrides).
  react: reactRoot,
  "react-dom": reactDomRoot,
  "react-native": reactNativeRoot,
};

module.exports = config;
