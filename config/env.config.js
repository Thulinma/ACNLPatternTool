// list of env strings, and if required
const clientEnvConfig = {
  NODE_ENV: false,
}

// multiple layers of correction exist for NODE_ENV
const defaultEnv = {
  HOST: "localhost",
  PORT: "3000",
};

module.exports = {
  clientEnvConfig,
  defaultEnv
}