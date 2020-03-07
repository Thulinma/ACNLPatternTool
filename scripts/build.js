// preamble before any imports
const env = require('../etc/env');

env.load();
// overload with NODE_ENV option
let buildSetting = process.argv[2];
if (!["development", "production"].includes(buildSetting))
  buildSetting = null;
else
  process.env.NODE_ENV = buildSetting
env.check();

const webpack = require('webpack');
const webpackFormatMessages = require('webpack-format-messages');
const signale = require('signale');
const {
  webpackConfig,
  webpackDevConfig,
  webpackProdConfig,
} = require('../config/webpack.config');
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

const compiler = webpack(selectedWebpackConfig);

compiler.hooks.invalid.tap('invalid', function() {
  signale.pending('Compiling application...');
});

compiler.hooks.done.tap('done', (stats) => {
  const messages = webpackFormatMessages(stats);

  if (!messages.errors.length && !messages.warnings.length) {
    signale.success(`Application compiled in ${buildSetting} mode!`);
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
});

compiler.run((error, stats) => {
  if (error) console.log(error);
  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, () => {
      console.log("");
      process.exit();
    });
  });
});