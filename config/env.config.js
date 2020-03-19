// list of env strings, and if needed to specify via .env
// only .env variables that the client should access here
// available internally to the build
const clientEnvConfig = {
  NODE_ENV: false,
  API_URL: false,
  IS_OFFLINE: false,
}

// multiple layers of correction exist for NODE_ENV
// default settings must pass validation by default
const defaultEnv = {
  DEV_HOST: "localhost",
  DEV_PORT: "3000",
  API_URL: "https://acpatterns.com/",
  IS_OFFLINE: false,
};

// transformations to be applied to env INSIDE the build
// transformed strings will not be avialable outside
const transformEnv = {
  IS_OFFLINE: () => {
    const { IS_OFFLINE } = process.env;
    return eval(IS_OFFLINE);
  }
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
  API_URL: () => {
    const { API_URL } = process.env;
    try { new URL(API_URL); return true; }
    catch (error) { return false; }
  },
  IS_OFFLINE: () => {
    try {
      const IS_OFFLINE = transformEnv.IS_OFFLINE();
      if ([true, false].includes(IS_OFFLINE)) return true;
      return true;
    }
    catch (error) { return false; }
  }
};

module.exports = {
  clientEnvConfig,
  defaultEnv,
  transformEnv,
  validateEnv
}
