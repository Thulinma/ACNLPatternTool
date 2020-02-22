const fse = require('fs-extra');
const signale = require('signale');
const { pathToBuild } = require('../etc/paths');

fse.removeSync(pathToBuild);
signale.success(`Build directory cleaned successfully!`);