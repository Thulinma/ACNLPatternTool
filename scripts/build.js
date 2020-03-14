// configure cli options
const yargs = require('yargs');
const argv = yargs
  .option("development", {
    alias: "d",
    describe: "forces development environment",
    type: "boolean"
  })
  .option("production", {
    alias: "p",
    describe: "forces production environment",
    type: "boolean"
  })
  .option("compressed", {
    alias: "c",
    default: false,
    describe: "produces only compressed files",
    type: "boolean"
  })
  .option("analyze", {
    alias: "a",
    default: false,
    describe: "produce bundle analysis",
    boolean: true
  })
  .conflicts("d", "p")
  .parse();

// overload NODE_ENV with command line option
const env = require('../etc/env');
env.load();
let buildSetting = argv.env;
if (!argv.development && !argv.production) // if no argument, use default set by .env file
  buildSetting = null;
else {
  if (argv.development) buildSetting = "development";
  else if (argv.production) buildSetting = "production";
  process.env.NODE_ENV = buildSetting
}
env.correct();
env.check();

const signale = require('signale');
const webpack = require('webpack');
const webpackFormatMessages = require('webpack-format-messages');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const {
  webpackConfig,
  webpackDevConfig,
  webpackProdConfig,
} = require('../config/webpack.config');
const { pathToBundleStats } = require('../etc/paths');
const {
  removeUncompressedBuild
} = require('../etc/utils');
const { NODE_ENV } = process.env;

// check process args, allow build with forced settings
let selectedWebpackConfig;
if (!["development", "production"].includes(buildSetting)) {
  selectedWebpackConfig = webpackConfig; // w/e the default is in .env
  buildSetting = NODE_ENV;
}
else
  if (buildSetting === "development") selectedWebpackConfig = webpackDevConfig;
  else selectedWebpackConfig = webpackProdConfig;

if (argv.analyze) selectedWebpackConfig.plugins.push(
  new BundleAnalyzerPlugin({
    analyzerMode: "static",
    reportFilename: pathToBundleStats,
    generateStatsFile: false,
    statsOptions: { source: true },
    openAnalyzer: true,
    logLevel: "silent"
  })
);

const compiler = webpack(selectedWebpackConfig);

compiler.hooks.invalid.tap('invalid', function() {
  signale.pending('Compiling application...');
});

compiler.hooks.done.tap('done', (stats) => {
  const messages = webpackFormatMessages(stats);

  if (!messages.errors.length && !messages.warnings.length) {
    signale.success(`Application compiled in ${buildSetting} mode!`);
    if (argv.analyze)
      signale.success(`Bundle report generated to ${pathToBundleStats}`)
  }

  if (messages.errors.length) {
    signale.fatal('Application failed to compile.');
    messages.errors.forEach(e => console.log(e));
    return;
  }

  if (messages.warnings.length) {
    signale.warn('Application compiled with warnings.');
    messages.warnings.forEach(w => console.log(w));
  }

  if (argv.compressed) {
    removeUncompressedBuild();
    signale.success('Uncompressed files removed from build.')
  }
});

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    console.log("");
    process.exit();
  });
});

compiler.run((error, stats) => {
  if (error) console.log(error);
});