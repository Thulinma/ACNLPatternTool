// SIMPLIFY HANDLING ENV CONDITIONS
const {
  NODE_ENV,
  IS_OFFLINE
} = process.env;

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

const isOffline = IS_OFFLINE;

const ifOfflineVal = (offlineVal, defaultVal) => {
  if (isOffline) return offlineVal;
  else return defaultVal;
}

const ifOfflineExec = (offlineCallback, defaultCallback) => {
  if (isOffline) offlineCallback();
  else if (defaultCallback) defaultCallback();
}



export {
  isDev,
  ifDevVal,
  ifDevExec,

  isProd,
  ifProdVal,
  ifProdExec,

  isOffline,
  ifOfflineVal,
  ifOfflineExec,
};