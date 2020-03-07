const fs = require('fs');
const dotenv = require('dotenv');
const signale = require('signale');
const {
  clientEnvConfig,
  defaultEnv
} = require('../config/env.config');
const { pathToEnv } = require('./paths');

const clientEnvReqConfig = Object.keys(clientEnvConfig)
  .filter((key) => { return clientEnvConfig[key]; });
const distinctReqEnvConfig = [...new Set(clientEnvReqConfig)].sort();

const load = () => {
  // load default first
  for (let [key, value] of Object.entries(defaultEnv))
    process.env[key] = value;
  if (fs.existsSync(pathToEnv))
    dotenv.config({ path: pathToEnv });
  if (!["development", "production"].includes(process.env.NODE_ENV))
    process.env.NODE_ENV = "development";
}

const check = () => {
  if (!["development", "production"].includes(process.env.NODE_ENV))
    process.env.NODE_ENV = "development";
  const errorMessages = [];
  if (!fs.existsSync(pathToEnv))
    if (Object.keys(distinctReqEnvConfig).length > 0)
      errorMessages.push(".env file could not be found.");
  // checks for missing environment variables
  distinctReqEnvConfig.forEach((envVar) => {
    if (envVar in process.env === false)
      errorMessages.push(`Environment variable: '${envVar} could not be found.`);
  });

  // reports all errors else continue
  if (errorMessages.length > 0) {
    errorMessages.forEach((message) => {
      signale.error(message);
    });
    process.exit(1);
  }
}

const buildClient = () => {
  // a, b, intersection
  const clientEnvVars = Object.keys(clientEnvConfig);
  const processEnvVars = new Set(Object.keys(process.env));
  const clientAvailEnvVars = [...clientEnvVars].filter(envVar => processEnvVars.has(envVar));

  // construct client env from what is available
  const clientEnv = clientAvailEnvVars
    .reduce((env, envVar) => {
      env[envVar] = process.env[envVar];
      return env;
    }, {});
  return clientEnv;
}

// process.env variables available to external (inside build process)
// process.env variables available to internal (inside built process)
module.exports = {
  load,
  check,
  buildClient,
}