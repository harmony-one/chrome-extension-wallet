const webpack = require("webpack");
const getClientEnvironment = require("./env");
const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const GenerateJsonPlugin = require("generate-json-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const isProduction = process.env.NODE_ENV === "production";
const manifest = require("./src/manifest");

const env = getClientEnvironment();

const config = {
  entry: {
    background: ["./src/background/"],
    popup: "./src/popup/",
    "content-script": "./src/content/",
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "./[name].js",
  },
  mode: process.env.NODE_ENV,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
        },
      },
      { test: /\.html$/, loader: "html-loader", query: { minimize: false } },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              url: false,
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "less-loader",
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre",
      },
      {
        test: /\.scss$/,
        loader: "style-loader!css-loader!sass-loader",
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "fonts/",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js",
    },
    extensions: ["*", ".js", ".vue", ".json"],
  },
  plugins: getPlugins(isProduction),
  performance: getPerformance(isProduction),
};

function getPerformance(isProd) {
  if (isProduction) {
    return {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    };
  }
  return {};
}

function getPlugins(isProd) {
  const plugins = [
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([{ from: "./static", to: "./" }], {}),
    new GenerateJsonPlugin("manifest.json", manifest, null, 2),
    new webpack.DefinePlugin(env.stringified),
    // new HardSourceWebpackPlugin()
  ];
  if (isProd) {
    plugins.push(
      new CleanWebpackPlugin(),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
      }),
      // new UglifyJSPlugin({
      //   sourceMap: true
      // }),
      new webpack.SourceMapDevToolPlugin({})
    );
  }
  return plugins;
}

module.exports = config;
