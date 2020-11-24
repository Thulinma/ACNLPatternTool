// DO NOT EVEN TRY TO USE BABEL-NODE CLI
// THIS FILE IS MEANT TO BE PASSED TO WEBPACK
const { pathToZxingBuild } = require('../etc/paths');

// USE WEBPACK FORMAT, NOT BABEL.CONFIG.JS FORMAT
const babelDevConfig = {
  presets: ['@babel/preset-env'],
  plugins: [
    [
      'babel-plugin-module-resolver',
      {
        alias: {
          "^@zxing/library$" :  pathToZxingBuild,
        }
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