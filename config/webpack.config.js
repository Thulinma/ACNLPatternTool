const { NODE_ENV } = process.env; // need env already run
const webpack = require('webpack');
const path = require('path');
// auto-generate the index.html file
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const { clientEnv } = require('../etc/env'); // assume already run
const {
  pathToClientSrc,
  pathToBuild,
} = require('../etc/paths');
const {
  babelDevConfig,
  babelProdConfig
} = require('./babel.config');

const baseConfig = {
  entry: [path.resolve(pathToClientSrc, "index")],
  output: {
    filename: "scripts/bundle.js",
    path: pathToBuild,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          // select 'options' babel config prod/dev when defining webpackConfig
        },
      },
      {
      // file-loader for image assets
        test: /\.(png|jpe?g|gif|svg|gltf)$/i,
        use: {
          loader: "file-loader",
          options: {
            outputPath: "assets" // relative to output dir
          },
        },
      },
      // file-loaders for fonts
      {
        test: /\.(ttf|woff|)$/i,
        use: {
          loader: "file-loader",
          options: {
            outputPath: "fonts" // relative to output dir
          },
        }
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({ "process.env": JSON.stringify(clientEnv) }),
  ],
};

const webpackDevConfig = {
  ...baseConfig,
  // overwrite base config
  mode: "development",
  devtool: "source-map",
  module: {
    ...baseConfig.module,
    rules: [
      {
        ...baseConfig.module.rules[0],
        use: {
          ...baseConfig.module.rules[0].use,
          options: babelDevConfig
        },
      },
      ...baseConfig.module.rules.slice(1)
    ]
  },
  plugins: [
    ...baseConfig.plugins,
    new HtmlWebpackPlugin({
      alwaysWriteToDisk: false,
      filename: "index.html",
    }),
    new HtmlWebpackHarddiskPlugin(), // ^ allows more options on top line
  ]
};

const webpackProdConfig = {
  ...baseConfig,
  // overwrite base config
  mode: "production",
  module: {
    ...baseConfig.module,
    rules: [
      {
        ...baseConfig.module.rules[0],
        use: {
          ...baseConfig.module.rules[0].use,
          options: babelProdConfig
        },
      },
      ...baseConfig.module.rules.slice(1)
    ]
  },
  plugins: [
    ...baseConfig.plugins,
    new HtmlWebpackPlugin(),
  ]
};

let webpackConfig = baseConfig;
if (NODE_ENV === "development")
  webpackConfig = webpackDevConfig;
else
  webpackConfig = webpackProdConfig;

module.exports = {
  webpackConfig, // default
  webpackDevConfig, // force dev
  webpackProdConfig, // force prod
}