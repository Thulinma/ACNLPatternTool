require('../etc/env'); // always run this first
const webpack = require('webpack');
const webpackFormatMessages = require('webpack-format-messages');
const WebpackDevServer = require('webpack-dev-server');
const signale = require('signale');
const { pathToPublic } = require('../etc/paths');
const {
  webpackConfig,
  webpackDevConfig,
  webpackProdConfig,
} = require('../config/webpack.config');
const {
  NODE_ENV,
  HOST,
  PORT
} = process.env;

// check process args, allow dev with forced settings
let selectedWebpackConfig;
let devSetting = process.argv[2]; // 0 is node, 1 is the script
if (!["development", "production"].includes(devSetting)) {
  selectedWebpackConfig = webpackConfig; // w/e is in NODE_ENV
  devSetting = NODE_ENV;
}
else
  if (devSetting === "production") selectedWebpackConfig = webpackProdConfig;
  else selectedWebpackConfig = webpackDevConfig; // go for default

const compiler = webpack(selectedWebpackConfig);

const webpackDevServer = new WebpackDevServer(compiler, {
  stats: false,
  open: true,
  contentBase: pathToPublic, // technically nonexistent, exists in memory
});

webpackDevServer.listen(PORT, HOST, (error) => {
  if (error)
    return console.log(error);

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, () => {
      console.log("");
      webpackDevServer.close();
      process.exit();
    });
  });
})

signale.success(`Development server deployed in ${devSetting} mode!`);