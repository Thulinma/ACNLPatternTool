const { NODE_ENV } = process.env;

const isDev = NODE_ENV === "development";

const ifDevVal = (devVal, defaultVal) => {
  if (isDev) return devVal;
  else return defaultVal;
};

const ifDevExec = (devCallback, defaultCallback) => {
  if (isDev) devCallback();
  else if (defaultCallback) defaultCallback();
};

const isProd = NODE_ENV === "production";

const ifProdVal = (prodVal, defaultVal) => {
  if (isProd) return prodVal;
  else return defaultVal;
};

const ifProdExec = (prodCallback, defaultCallback) => {
  if (isProd) prodCallback();
  else if (defaultCallback) defaultCallback();
};


export {
  isDev,
  ifDevVal,
  ifDevExec,

  isProd,
  ifProdVal,
  ifProdExec,
};