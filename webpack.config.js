const webpack = require("webpack");
const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const GenerateJsonPlugin = require("generate-json-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const ZipPlugin = require("zip-webpack-plugin");
const isProduction = process.env.NODE_ENV === "production";
const manifest_dev = require("./src/manifest-dev");
const manifest_prod = require("./src/manifest-prod");

const config = {
  entry: {
    background: ["./src/background/"],
    popup: "./src/popup/",
    "content-script": "./src/content/",
    "inject-script": "./src/content/injectScript.js",
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "./[name].js",
  },
  node: {
    fs: "empty",
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
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "sass-loader",
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
        test: /\.ts?$/,
        use: ["ts-loader"],
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
      "~": path.resolve("./src"),
      mixins: path.resolve("./src/popup/mixins"),
      services: path.resolve("./src/services"),
      components: path.resolve("./src/popup/components"),
      popup: path.resolve("./src/popup"),
    },
    extensions: ["*", ".js", ".ts", ".tsx", ".vue", ".json"],
  },
  plugins: getPlugins(isProduction),
  performance: getPerformance(isProduction),
};

function getPerformance(isProd) {
  if (isProd) {
    return {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    };
  }
  return {};
}

function getPlugins(isProd) {
  let plugins = [
    new VueLoaderPlugin(),
    new CopyWebpackPlugin({ patterns: [{ from: "./static", to: "./" }] }),
  ];
  if (!isProd) {
    plugins.push(
      new GenerateJsonPlugin("manifest.json", manifest_dev, null, 2)
    );
  } else {
    plugins.push(
      new GenerateJsonPlugin("manifest.json", manifest_prod, null, 2),
      new CleanWebpackPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
      }),
      new webpack.SourceMapDevToolPlugin({}),
      new ZipPlugin({
        path: "..",
        filename: "onewallet.zip",
      })
    );
  }
  return plugins;
}

module.exports = config;
