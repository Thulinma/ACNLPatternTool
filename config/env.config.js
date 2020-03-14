// list of env strings, and if required
const clientEnvConfig = {
  NODE_ENV: false,
  ORIGIN_URL: false
}

// multiple layers of correction exist for NODE_ENV
const defaultEnv = {
  DEV_HOST: "localhost",
  DEV_PORT: "3000",
  ORIGIN_URL: "http://localhost:3000/",
};

module.exports = {
  clientEnvConfig,
  defaultEnv
}