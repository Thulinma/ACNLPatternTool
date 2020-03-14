// list of env strings, and if required
// only .env variables that the client should access here
// available internally to the build
const clientEnvConfig = {
  NODE_ENV: false,
  ORIGIN_URL: false,
  API_URL: false,
}

// multiple layers of correction exist for NODE_ENV
// default settings must pass validation by default
const defaultEnv = {
  DEV_HOST: "localhost",
  DEV_PORT: "3000",
  ORIGIN_URL: "http://localhost:3000/",
  API_URL: "https://acpatterns.com/",
};

const validateEnv = {
  NODE_ENV: () => {
    const { NODE_ENV } = process.env;
    return ["development", "production"].includes(NODE_ENV);
  },
  DEV_PORT: () => {
    const { DEV_PORT } = process.env;
    try {
      if (
        Number.isInteger(Number.parseFloat(DEV_PORT))
      ) return true;
      else return false;
    }
    catch (error) { return false; }
  },
  ORIGIN_URL: () => {
    const { ORIGIN_URL } = process.env;
    try { new URL(ORIGIN_URL); return true; }
    catch (error) { return false; }
  },
  API_URL: () => {
    const { API_URL } = process.env;
    try { new URL(API_URL); return true; }
    catch (error) { return false; }
  }
}

module.exports = {
  clientEnvConfig,
  defaultEnv,
  validateEnv
}
