// DO NOT EVEN TRY TO USE BABEL-NODE CLI
// THIS FILE IS MEANT TO BE PASSED TO WEBPACK
const { pathToClientSrc } = require('../etc/paths');

// USE WEBPACK FORMAT, NOT BABEL.CONFIG.JS FORMAT
const babelDevConfig = {
  presets: ['@babel/preset-env'],
  plugins: [
    [
      'babel-plugin-module-resolver',
      {
        root: [pathToClientSrc],
        alias: {} // tbd, likely env conditional functions
      }
    ],
    ["@babel/plugin-transform-runtime", {}],
    ["@babel/plugin-transform-modules-commonjs", {}],
  ],
};

const babelProdConfig = {
  ...babelDevConfig
}

module.exports = {
  babelDevConfig,
  babelProdConfig,
}