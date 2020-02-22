const fs = require('fs');
const dotenv = require('dotenv');
const signale = require('signale');
const {
  clientEnvConfig,
  defaultEnv
} = require('../config/env.config');
const { pathToEnv } = require('./paths');

const distinctReqEnvConfig = [...new Set(clientEnvConfig)].sort();

const errorMessages = [];

// load default first
for (let [key, value] of Object.entries(defaultEnv))
  process.env[key] = value;

// check for environment file, load it
if (fs.existsSync(pathToEnv))
  dotenv.config({ path: pathToEnv });
else
  if (clientEnvConfig.length > 0)
    errorMessages.push(".env file could not be found.");

if (process.env.NODE_ENV !== "production")
  process.env.NODE_ENV = "development";

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

// merge clientEnv with defaultEnv
const clientEnv = clientEnvConfig.reduce((env, envVar) => {
  env[envVar] = process.env[envVar];
  return env;
}, {...defaultEnv})

// process.env variables available to external (inside build process)
// process.env variables available to internal (inside built process)

module.exports = {
  clientEnv
}