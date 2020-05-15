const path = require('path');

const parent = path.resolve(__dirname);
// path to directories
const pathToRoot = path.resolve(parent, "..");
const pathToConfig = path.resolve(pathToRoot, "config");
const pathToEtc = path.resolve(pathToRoot, "etc");
const pathToPublic = path.resolve(pathToRoot, "public");
const pathToClientSrc = path.resolve(pathToRoot, "src");
const pathToBuild = path.resolve(pathToRoot, "build");
const pathToStats = path.resolve(pathToRoot, "stats");
const pathToInjected = path.resolve(pathToRoot, "injected");
const pathToNodeModules = path.resolve(pathToRoot, "node_modules");
const pathToZxingSubmodule = path.resolve(pathToRoot, "zxing-js-library");

// paths to specific files
const pathToEnv = path.resolve(pathToRoot, ".env");
const pathToBabelConfig = path.resolve(pathToConfig, "babel.config.js");
const pathToEnvConfig = path.resolve(pathToConfig, "env.config.js");
const pathToWebpackConfig = path.resolve(pathToConfig, "webpack.config.js");
const pathToPublicIndex = path.resolve(pathToPublic, "index.ejs");
const pathToFavicon = path.resolve(pathToPublic, "favicon.svg");
const pathToClientSrcIndex = path.resolve(pathToClientSrc, "index.js")
const pathToPathsJs = path.resolve(pathToEtc, "paths.js");
const pathToZxingBuild = path.resolve(pathToZxingSubmodule, "esm5");
const pathToBundleStats = path.resolve(pathToStats, "bundle.html");

module.exports = {
  pathToRoot,
  pathToConfig,
  pathToEtc,
  pathToPublic,
  pathToClientSrc,
  pathToBuild,
  pathToStats,
  pathToInjected,
  pathToNodeModules,
  pathToEnv,
  pathToBabelConfig,
  pathToEnvConfig,
  pathToWebpackConfig,
  pathToPublicIndex,
  pathToFavicon,
  pathToClientSrcIndex,
  pathToPathsJs,
  pathToZxingBuild,
  pathToBundleStats
};