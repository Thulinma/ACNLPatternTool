require('../etc/env'); // always run this first
const webpack = require('webpack');
const webpackFormatMessages = require('webpack-format-messages');
const signale = require('signale');
const {
  webpackConfig,
  webpackDevConfig,
  webpackProdConfig,
} = require('../config/webpack.config');

// check process args, allow build with forced settings
let selectedWebpackConfig;
let devSetting = process.argv[2]; // 0 is node, 1 is the script
if (!["development", "production"].includes(devSetting))
  selectedWebpackConfig = webpackConfig; // w/e is in NODE_ENV
else
  if (devSetting === "development") selectedWebpackConfig = webpackDevConfig;
  else selectedWebpackConfig = webpackProdConfig;

const compiler = webpack(selectedWebpackConfig);

compiler.hooks.invalid.tap('invalid', function() {
  signale.pending('Compiling application...');
});

compiler.hooks.done.tap('done', (stats) => {
  const messages = webpackFormatMessages(stats);

  if (!messages.errors.length && !messages.warnings.length) {
    signale.success('Application compiled!');
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
      process.exit();
    });
  });
});