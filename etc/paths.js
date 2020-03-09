const path = require('path');

// path to directories
const pathToRoot = process.cwd();
const pathToConfig = path.resolve(pathToRoot, "config");
const pathToEtc = path.resolve(pathToRoot, "etc");
const pathToPublic = path.resolve(pathToRoot, "public");
const pathToClientSrc = path.resolve(pathToRoot, "src");
const pathToBuild = path.resolve(pathToRoot, "build");
const pathToStats = path.resolve(pathToRoot, "stats");
const pathToNodeModules = path.resolve(pathToRoot, "node_modules");
const pathToZxingSubmodule = path.resolve(pathToRoot, "zxing-js-library");

// paths to specific files
const pathToEnv = path.resolve(pathToRoot, ".env");
const pathToBabelConfig = path.resolve(pathToConfig, "babel.config.js");
const pathToEnvConfig = path.resolve(pathToConfig, "env.config.js");
const pathToWebpackConfig = path.resolve(pathToConfig, "webpack.config.js");
const pathToPublicIndex = path.resolve(pathToPublic, "index.ejs");
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
  pathToNodeModules,
  pathToEnv,
  pathToBabelConfig,
  pathToEnvConfig,
  pathToWebpackConfig,
  pathToPublicIndex,
  pathToClientSrcIndex,
  pathToPathsJs,
  pathToZxingBuild,
  pathToBundleStats
};