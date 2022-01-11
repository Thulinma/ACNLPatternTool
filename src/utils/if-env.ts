// SIMPLIFY HANDLING ENV CONDITIONS
const {
  NODE_ENV,
  IS_OFFLINE
} = env;

const isDev = NODE_ENV === "development";

const ifDevVal = <T>(
  devVal: T,
  defaultVal: T,
): T => {
  if (isDev) return devVal;
  else return defaultVal;
};

const ifDevExec = <T extends Function>(
  devCallback: T,
  defaultCallback: T,
): void => {
  if (isDev) devCallback();
  else if (defaultCallback) defaultCallback();
};


const isProd = NODE_ENV === "production";

const ifProdVal = <T>(
  prodVal: T,
  defaultVal: T,
): T => {
  if (isProd) return prodVal;
  else return defaultVal;
};

const ifProdExec = <T extends Function>(
  prodCallback: T,
  defaultCallback: T,
): void => {
  if (isProd) prodCallback();
  else if (defaultCallback) defaultCallback();
};


const isOffline = IS_OFFLINE;

const ifOfflineVal = <T>(
  offlineVal: T,
  defaultVal: T,
): T => {
  if (isOffline) return offlineVal;
  else return defaultVal;
};

const ifOfflineExec = <T extends Function>(
  offlineCallback: T,
  defaultCallback: T,
): void => {
  if (isOffline) offlineCallback();
  else if (defaultCallback) defaultCallback();
};


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