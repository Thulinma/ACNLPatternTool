const { NODE_ENV } = process.env;

const ifDevVal = (devVal, defaultVal) => {
  if (NODE_ENV === "development") return devVal;
  else return defaultVal;
};

const ifDevExec = (devCallback, defaultCallback) => {
  if (NODE_ENV === "development") devCallback();
  else if (defaultCallback) defaultCallback();
};

const ifProdVal = (prodVal, defaultVal) => {
  if (NODE_ENV === "production") return prodVal;
  else return defaultVal;
};

const ifProdExec = (prodCallback, defaultCallback) => {
  if (NODE_ENV === "production") prodCallback();
  else if (defaultCallback) defaultCallback();
};

export {
  ifDevVal,
  ifDevExec,
  ifProdVal,
  ifProdExec
};