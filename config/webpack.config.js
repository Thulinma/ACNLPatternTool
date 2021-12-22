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
  pathToPublicIndex,
  pathToFavicon,
  pathToClientSrcIndex,
} = require('../etc/paths');


const injection = require('../etc/injection');

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
      use: {
        loader: "file-loader",
        options: {
          outputPath: "images",
        }
      }
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


const fileRules = [
  mdRule,
  svgRule,
  csvRule,
  {
    // file-loader for image assets
    test: /\.(png|jpe?g|gif)$/i,
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

const fonts = [
  { family: "Nunito", variants: ["600", "700", "800"], },
  { family: "Roboto", variants: ["100", "300", "400", "500", "700", "900"],  }
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
  new webpack.DefinePlugin({ "process.injected": JSON.stringify(injection) }),
];

const pluginsDev = [
  ...plugins,
  new HtmlWebpackPlugin({
    ...htmlWebpackOptions,
    filename: "index.html",
  }),
  new FaviconsWebpackPlugin({
    logo: pathToFavicon,
    inject: true,
    prefix: "favicons",
  }),
];

const pluginsProd = [
  ...plugins,
  new MiniCssExtractPlugin({
    filename: "styles/style.css",
  }),
  new HtmlWebpackPlugin({
    ...htmlWebpackOptions,
  }),
  new FaviconsWebpackPlugin({
    logo: pathToFavicon,
    inject: true,
    prefix: "favicons",
  }),
];


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