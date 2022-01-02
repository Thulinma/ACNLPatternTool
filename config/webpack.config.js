const path = require('path');
const webpack = require('webpack');
// auto-generate the index.html file
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const { VuetifyLoaderPlugin } = require('vuetify-loader');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeThreePlugin = require('@vxna/optimize-three-webpack-plugin');
const env = require('../etc/env'); // assume already loaded, checked
const {
  pathToClientSrc,
  pathToBuild,
  pathToInjected,
  pathToPublicIndex,
  pathToFavicon,
  pathToClientSrcIndex,
} = require('../etc/paths');


const clientEnv = env.buildClient();

const entry = [pathToClientSrcIndex];

const output = {
  filename: "scripts/bundle.js",
  publicPath: "/",
  path: pathToBuild,
};


const swcRule = {
  test: /\.m?(js|ts)$/i,
  exclude: /(node_modules|bower_components)/,
  use: {
    loader: 'swc-loader',
  }
};

const vueRule = {
  test: /\.vue$/i,
  loader: 'vue-loader'
};


const scssRuleDev = {
  test: /\.(css|scss)$/i,
  use: [
    'vue-style-loader',
    'css-loader',
    {
      loader: 'sass-loader',
      options: {
        implementation: require("sass"),
        sourceMap: true,
        sassOptions: {
          includePaths: [pathToClientSrc],
          indentedSyntax: false,
        }
      }
    }
  ]
};

const scssRuleProd = {
  ...scssRuleDev,
  sideEffects: true,
  use: [
    MiniCssExtractPlugin.loader,
    'css-loader',
    {
      loader: 'sass-loader',
      options: {
        sourceMap: false,
        sassOptions: {
          ...scssRuleDev.use[2].options.sassOptions,
          outputStyle: 'compressed',
        }
      }
    }
  ]
}

const sassRuleDev = {
  test: /\.(sass)$/i,
  use: [
    'vue-style-loader',
    'css-loader',
    {
      loader: 'sass-loader',
      options: {
        implementation: require("sass"),
        sourceMap: true,
        sassOptions: {
          includePaths: [pathToClientSrc],
          indentedSyntax: true,
        }
      }
    }
  ]
};

const sassRuleProd = {
  ...sassRuleDev,
  sideEffects: true,
  use: [
    MiniCssExtractPlugin.loader,
    'css-loader',
    {
      loader: 'sass-loader',
      options: {
        sourceMap: false,
        sassOptions: {
          ...sassRuleDev.use[2].options.sassOptions,
          outputStyle: 'compressed',
        }
      }
    }
  ]
}


// use resourceQuery for svgs
const svgRule = {
  test: /\.(svg)$/i,
  oneOf: [
    {
      // default
      resourceQuery: /inline/i,
      use: [
        {
          loader: "vue-svg-loader",
          options: {
            svgo: {
              plugins: [
                { removeDimensions: true },
                { removeViewBox: false },
              ],
            },
          },
        },
      ]
    },
    {
      type: "asset/resource",
      generator: {
        filename: "images/[hash][ext][query]",
      },
    },
  ],
};


const mdRule = {
  test: /\.(md)$/i,
  use: [
    {
      loader: "vue-loader",
    },
    {
      loader: 'vue-markdown-loader/lib/markdown-compiler',
      options: {
        raw: true,
      }
    }
  ]
};

const csvRule = {
  test: /\.csv$/,
  loader: 'csv-loader',
  options: {
    dynamicTyping: false,
    header: true,
    skipEmptyLines: true
  },
};


const imageRule = {
  test: /\.(png|jpe?g|gif)$/i,
  type: "asset/resource",
  generator: {
    filename: "images/[hash][ext][query]",
  },
};

// texture loader
const textureOfflineRule = {
  test: /injected\/.*\.(png)$/i,
  type: "asset/inline",
};
const textureOnlineRule = {
  test: /injected\/.*\.(png)$/i,
  type: "asset/resource",
  generator: {
    filename: "models/[hash][ext][query]",
  },
};

// gltf loader
const gltfOfflineRule = {
  test: /injected\/.*\.(gltf)$/i,
  type: "asset/inline",
};
const gltfOnlineRule = {
  test: /injected\/.*\.(gltf)$/i,
  type: "asset/resource",
  generator: {
    filename: "models/[hash][ext][query]",
  },
};

const fileRules = [
  mdRule,
  svgRule,
  csvRule,
  {
    oneOf: [
      // loader for texture maps
      env.ifOfflineVal(
        textureOfflineRule,
        textureOnlineRule,
      ),
      // loader for image files
      imageRule,
    ],
  },
  env.ifOfflineVal(
    gltfOfflineRule,
    gltfOnlineRule,
  ),
];



const rulesDev = [
  swcRule,
  vueRule,
  scssRuleDev,
  sassRuleDev,
  ...fileRules
];

const rulesProd = [
  swcRule,
  vueRule,
  scssRuleProd,
  sassRuleProd,
  ...fileRules
];

const htmlWebpackOptions = {
  inject: true,
  hash: true,
  template: pathToPublicIndex,
  title: 'Animal Crossing Pattern Tool',
};

const plugins = [
  new VueLoaderPlugin(),
  new VuetifyLoaderPlugin(),
  new OptimizeThreePlugin(),
  new webpack.DefinePlugin({ "process.env": JSON.stringify(clientEnv) }),
];

const faviconsWebpackPlugin = new FaviconsWebpackPlugin({
  logo: pathToFavicon,
  inject: true,
  mode: env.ifProdVal("webapp", "light"),
})

const pluginsDev = [
  ...plugins,
  new HtmlWebpackPlugin({
    ...htmlWebpackOptions,
    filename: "index.html",
  }),
  faviconsWebpackPlugin,
];

const pluginsProd = [
  ...plugins,
  new MiniCssExtractPlugin({
    filename: "styles/style.css",
  }),
  new HtmlWebpackPlugin({
    ...htmlWebpackOptions,
  }),
  faviconsWebpackPlugin,
];


const optimization = {
};

const optimizationDev = {
  ...optimization,
};

const optimizatonProd = {
  minimizer: [
    new TerserPlugin({
      test: /\.js(\?.*)?$/i,
      terserOptions: {
        mangle: true,
        ie8: false,
      },
      extractComments: true,
    }),
  ],
};

const resolve = {
  extensions: [
    ".js",
    ".ts",
    ".vue",
  ],
  alias: {
    "@": pathToClientSrc,
    // online/offline should export the same shapes
    "Injected": pathToInjected,
  }
};

const webpackBaseConfig = {
  stats: 'minimal',
};

const webpackDevConfig = {
  ...webpackBaseConfig,
  mode: "development",
  devtool: "source-map",
  entry,
  output,
  module: {
    rules: rulesDev
  },
  plugins: pluginsDev,
  optimization: optimizationDev,
  resolve
};

const webpackProdConfig = {
  ...webpackBaseConfig,
  mode: "production",
  devtool: false,
  entry,
  output,
  module: {
    rules: rulesProd,
  },
  plugins: pluginsProd,
  optimization: optimizatonProd,
  // ignore webpack performance warnings
  // not a good gauge
  performance: false,
  resolve
};

// default setting, set by .env
let webpackConfig = env.ifProdVal(webpackProdConfig, webpackDevConfig);

module.exports = {
  webpackConfig, // default
  webpackDevConfig, // force dev
  webpackProdConfig, // force prod
}