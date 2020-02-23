const webpack = require('webpack');
// auto-generate the index.html file
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const { clientEnv } = require('../etc/env'); // assume already run
const {
  pathToBuild,
  pathToPublicIndex,
  pathToClientSrcIndex
} = require('../etc/paths');
const {
  babelDevConfig,
  babelProdConfig
} = require('./babel.config');
const { NODE_ENV } = process.env; // need env already run

const baseConfig = {
  entry: [pathToClientSrcIndex],
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
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        loader: [
          'vue-style-loader',
          'css-loader'
        ]
      },
      {
      // file-loader for image assets
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: {
          loader: "file-loader",
          options: {
            outputPath: "images" // relative to output dir
          },
        },
      },
      // file-loader for models
      {
        test: /\.(gltf)$/i,
        use: {
          loader: "file-loader",
          options: {
            outputPath: "resources" // relative to output.path
          }
        }
      },
      // file-loaders for fonts
      {
        test: /\.(ttf|woff|)$/i,
        use: {
          loader: "file-loader",
          options: {
            outputPath: "fonts" // relative to output.path
          },
        }
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({ "process.env": JSON.stringify(clientEnv) }),
  ],
};

const baseHtmlWebpackOptions = {
  inject: true,
  hash: true,
  template: pathToPublicIndex,
  title: 'Animal Crossing Pattern Tool',
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
      ...baseHtmlWebpackOptions,
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