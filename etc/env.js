const fs = require('fs');
const dotenv = require('dotenv');
const signale = require('signale');
const {
  clientEnvConfig,
  defaultEnv,
  transformEnv,
  validateEnv
} = require('../config/env.config');
const { pathToEnv } = require('./paths');

const clientEnvReqConfig = Object.keys(clientEnvConfig)
  .filter((key) => { return clientEnvConfig[key]; });
const distinctReqEnvConfig = [...new Set(clientEnvReqConfig)].sort();
const includedEnvConfig = [
  ... new Set([
    ...clientEnvReqConfig,
    ...Object.keys(defaultEnv)
  ])
].sort();

const load = () => {
  // dot env skips ones that are already set, use it first
  if (fs.existsSync(pathToEnv))
    dotenv.config({ path: pathToEnv });
  // fill in gaps with default
  for (let [key, value] of Object.entries(defaultEnv))
    if (!(key in process.env)) process.env[key] = value;
};

const correct = () => {
  const {
    NODE_ENV,
  } = process.env;

  if (!["development", "production"].includes(NODE_ENV))
    process.env.NODE_ENV = "development";
};

const check = () => {
  const errorMessages = [];
  if (!fs.existsSync(pathToEnv))
    if (Object.keys(distinctReqEnvConfig).length > 0)
      errorMessages.push(".env file could not be found.");
  // checks for missing environment variables
  distinctReqEnvConfig.forEach((envVar) => {
    if (envVar in process.env === false)
      errorMessages.push(`Environment variable: '${envVar}' could not be found.`);
  });

  includedEnvConfig.forEach((envVar) => {
    if (envVar in validateEnv) {
      if (!validateEnv[envVar]())
        errorMessages.push(`Environment variable: '${envVar}' was not valid.`);
    }
  });

  // reports all errors else continue
  if (errorMessages.length > 0) {
    errorMessages.forEach((message) => {
      signale.error(message);
    });
    process.exit(1);
  }
};

const buildClient = () => {
  // a, b, intersection
  const clientEnvVars = Object.keys(clientEnvConfig);
  const processEnvVars = new Set(Object.keys(process.env));
  const clientAvailEnvVars = [...clientEnvVars].filter(envVar => processEnvVars.has(envVar));

  // construct client env from what is available
  const clientEnv = clientAvailEnvVars
    .reduce((env, envVar) => {
      if (envVar in transformEnv)
        env[envVar] = transformEnv[envVar]();
      else
        env[envVar] = process.env[envVar];
      return env;
    }, {});
  return clientEnv;
};

// UTILITIES
const ifDevVal = (devVal, defaultVal) => {
  const { NODE_ENV } = process.env;
  const isDev = NODE_ENV === "development";
  if (isDev) return devVal;
  else return defaultVal;
};

const ifDevExec = (devCallback, defaultCallback) => {
  const { NODE_ENV } = process.env;
  const isDev = NODE_ENV === "development";
  if (isDev) devCallback();
  else if (defaultCallback) defaultCallback();
};


const ifProdVal = (prodVal, defaultVal) => {
  const { NODE_ENV } = process.env;
  const isProd = NODE_ENV === "production";
  if (isProd) return prodVal;
  else return defaultVal;
};

const ifProdExec = (prodCallback, defaultCallback) => {
  const { NODE_ENV } = process.env;
  const isProd = NODE_ENV === "production";
  if (isProd) prodCallback();
  else if (defaultCallback) defaultCallback();
};


const ifOfflineVal = (offlineVal, defaultVal) => {
  const { IS_OFFLINE } = process.env;
  const isOffline = IS_OFFLINE === String(true);
  if (isOffline) return offlineVal;
  else return defaultVal;
}

const ifOfflineExec = (offlineCallback, defaultCallback) => {
  const { IS_OFFLINE } = process.env;
  const isOffline = IS_OFFLINE === String(true);
  if (isOffline) offlineCallback();
  else if (defaultCallback) defaultCallback();
}

// process.env variables available to external (inside build process)
// process.env variables available to internal (inside built process)
module.exports = {
  load,
  correct,
  check,
  buildClient,
  ifDevVal,
  ifDevExec,
  ifProdVal,
  ifProdExec,
  ifOfflineVal,
  ifOfflineExec,
}