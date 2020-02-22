const path = require('path');

// path to directories
const pathToRoot = process.cwd();
const pathToConfig = path.resolve(pathToRoot, "config");
const pathToEtc = path.resolve(pathToRoot, "etc");
const pathToPublic = path.resolve(pathToRoot, "public");
const pathToClientSrc = path.resolve(pathToRoot, "src");
const pathToBuild = path.resolve(pathToRoot, "build");
const pathToNodeModules = path.resolve(pathToRoot, "node_modules");

// paths to specific files
const pathToEnv = path.resolve(pathToRoot, ".env");
const pathToBabelConfig = path.resolve(pathToConfig, "babel.config.js");
const pathToEnvConfig = path.resolve(pathToConfig, "env.config.js");
const pathToWebpackConfig = path.resolve(pathToConfig, "webpack.config.js");
const pathToConditionalJs = path.resolve(pathToEtc, "conditional.js");
const pathToEnvJs = path.resolve(pathToEtc, "env.js");
const pathToPathsJs = path.resolve(pathToEtc, "paths.js");


module.exports = {
  pathToRoot,
  pathToConfig,
  pathToEtc,
  pathToPublic,
  pathToClientSrc,
  pathToBuild,
  pathToNodeModules,
  pathToEnv,
  pathToBabelConfig,
  pathToEnvConfig,
  pathToWebpackConfig,
  pathToConditionalJs,
  pathToEnvJs,
  pathToPathsJs,
};