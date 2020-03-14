// list of env strings, and if required
const clientEnvConfig = {
  NODE_ENV: false,
  ORIGIN_URL: false
}

// multiple layers of correction exist for NODE_ENV
// default settings must past validation by default
const defaultEnv = {
  DEV_HOST: "localhost",
  DEV_PORT: "3000",
  ORIGIN_URL: "http://localhost:3000/",
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
  }
}

module.exports = {
  clientEnvConfig,
  defaultEnv,
  validateEnv
}