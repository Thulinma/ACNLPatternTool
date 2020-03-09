const fse = require('fs-extra');
const signale = require('signale');
const {
  pathToBuild,
  pathToStats
} = require('../etc/paths');

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    console.log("");
    webpackDevServer.close();
    process.exit();
  });
});

fse.removeSync(pathToBuild);
fse.removeSync(pathToStats);
signale.success(`Build directory cleaned successfully!`);
signale.success(`Stats directory cleaned successfully!`);