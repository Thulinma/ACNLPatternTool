// preamble before any imports
const env = require('../etc/env');
env.load();
env.correct();
env.check();

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const signale = require('signale');
const { pathToPublic } = require('../etc/paths');
const { webpackDevConfig } = require('../config/webpack.config');
const {
  DEV_HOST,
  DEV_PORT
} = process.env;

const compiler = webpack(webpackDevConfig);

const webpackDevServer = new WebpackDevServer(compiler, {
  open: true,
  static: {
    directory: pathToPublic, // technically nonexistent, exists in memory
  },
  client: {
    progress: true,
    reconnect: true,
    overlay: {
      errors: true,
      warnings: true,
    },
  },
  historyApiFallback: true,
});

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    console.log("");
    webpackDevServer.close();
    process.exit();
  });
});

webpackDevServer.listen(DEV_PORT, DEV_HOST, (error) => {
  if (error) return console.log(error);
})

signale.success(`Development server deployed in ${"development"} mode!`);