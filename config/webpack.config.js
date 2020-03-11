const webpack = require('webpack');
// auto-generate the index.html file
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const OptimizeThreePlugin = require('@vxna/optimize-three-webpack-plugin');
const env = require('../etc/env'); // assume already loaded, checked
const {
  pathToBuild,
  pathToPublicIndex,
  pathToClientSrcIndex
} = require('../etc/paths');
const {
  babelDevConfig,
  babelProdConfig
} = require('./babel.config');
const injection = require('../etc/injection');

const clientEnv = env.buildClient();

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
        // test: /\.s?css$/,
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          // MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false,
              sassOptions: {
                outputStyle: 'compressed',
              },
            }
          }
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
    new OptimizeThreePlugin(),
    new webpack.DefinePlugin({ "process.env": JSON.stringify(clientEnv) }),
    new webpack.DefinePlugin({"process.injected": JSON.stringify(injection)}),
    // new MiniCssExtractPlugin({
    //   filename: "styles/style.css"
    // })
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
    new HtmlWebpackHarddiskPlugin(), // ^ allows more options
  ]
};

const webpackProdConfig = {
  ...baseConfig,
  devtool: "",
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
    new HtmlWebpackPlugin({
      ...baseHtmlWebpackOptions,
    }),
    new CompressionPlugin({
      algorithm: "gzip",
      deleteOriginalAssets: false,
      compressionOptions: {
        level: 9 // max compression
      }
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        terserOptions: {
          mangle: true,
          ie8: false,
        },
        extractComments: true,
      }),
      // new OptimizeCSSAssetsPlugin({}),
    ],
  },
  // ignore webpack performance warnings
  // not a good gauge
  performance: false
};

// default setting, set by .env
let webpackConfig = env.ifProdVal(webpackProdConfig, webpackDevConfig);

module.exports = {
  webpackConfig, // default
  webpackDevConfig, // force dev
  webpackProdConfig, // force prod
}