// configure cli options
const yargs = require('yargs');
const argv = yargs
  .option("development", {
    alias: "d",
    describe: "Use development environment",
    type: "boolean"
  })
  .option("production", {
    alias: "p",
    describe: "Use production environment",
    type: "boolean"
  })
  .option("uncompressed", {
    alias: "u",
    describe: "Produce only uncompressed",
    type: "boolean"
  })
  .option("compressed", {
    alias: "c",
    describe: "Produce only compressed",
    type: "boolean"
  })
  .option("analyze", {
    alias: "a",
    describe: "Analyze bundle",
    type: "boolean"
  })
  .conflicts("development", "production")
  .conflicts("uncompressed", "compressed")
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
const {
  pathToBuild,
  pathToBundleStats,
} = require('../etc/paths');
const compress = require('../etc/compress');
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

let isCompiled = false;
const compiler = webpack(selectedWebpackConfig);

compiler.hooks.invalid.tap('invalid', function() {
  signale.pending('Compiling application...');
});

compiler.hooks.done.tap('done', (stats) => {
  const messages = webpackFormatMessages(stats);

  if (!messages.errors.length && !messages.warnings.length) {
    isCompiled = true;
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
    isCompiled = true;
    signale.warn('Application compiled with warnings.');
    messages.warnings.forEach(w => console.log(w));
  }
});

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    console.log("");
    process.exit();
  });
});

(async () => {
  await new Promise((resolve) => {
    compiler.run((error, stats) => {
      if (error)
        console.log(error);
      else console.log(stats.toString({
        chunks: true,
        colors: true,
      }));
      compiler.close(_error => {
        resolve();
      });
    });
  });

  if (!isCompiled) return;

  // compression & compression elimination
  compress.create(pathToBuild);
  if (argv.compressed) {
    compress.destroy(pathToBuild, false); // remove uncompressed
    signale.success('Uncompressed files removed from build.');
  }
  if (argv.uncompressed) {
    compress.destroy(pathToBuild, true); // remove compressed
    signale.success('Compressed files removed from build.');
  }
})();