// configure cli options
const yargs = require("yargs");
const argv = yargs
  .option("offline", {
    alias: "o",
    describe: "Offline (embedded assets)",
    type: "boolean",
  })
  .parse();

// overload NODE_ENV with command line option
const env = require('../etc/env');
env.load();
if (argv.offline)
  process.env.IS_OFFLINE = true;
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

const webpackDevServer = new WebpackDevServer({
  host: DEV_HOST,
  port: DEV_PORT,
  open: true,
  static: {
    directory: pathToPublic, // technically nonexistent, exists in memory
  },
  client: {
    progress: false,
    reconnect: true,
    overlay: {
      errors: true,
      warnings: true,
    },
  },
  historyApiFallback: true,
}, compiler);

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    console.log("");
    webpackDevServer.stop();
    process.exit();
  });
});

(async () => {
  await webpackDevServer.start();  
  signale.success(`Development server deployed in ${"development"} mode!`);
})();
