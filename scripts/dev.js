// preamble before any imports
const env = require('../etc/env');
env.load();
env.check();

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const signale = require('signale');
const { pathToPublic } = require('../etc/paths');
const { webpackDevConfig } = require('../config/webpack.config');
const {
  HOST,
  PORT
} = process.env;

const compiler = webpack(webpackDevConfig);

const webpackDevServer = new WebpackDevServer(compiler, {
  stats: false,
  open: true,
  contentBase: pathToPublic, // technically nonexistent, exists in memory
  overlay: {
    warnings: true,
    errors: true,
  }
});

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    console.log("");
    webpackDevServer.close();
    process.exit();
  });
});

webpackDevServer.listen(PORT, HOST, (error) => {
  if (error) return console.log(error);
})

signale.success(`Development server deployed in ${"development"} mode!`);