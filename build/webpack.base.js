const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { cssLoaders, htmlPage } = require("./tools");

const rootDir = path.resolve(__dirname, "..");

let resolve = (dir) => path.join(rootDir, "src", dir);

module.exports = {
  entry: {
    background: ["./src/background.js"],
    popup: resolve("./popup"),
    "content-script": "./src/content-scripts/content-script.js",
  },
  output: {
    path: path.join(rootDir, "dist"),
    publicPath: "/",
    filename: "js/[name].js",
    chunkFilename: "js/[id].[name].js?[hash]",
    library: "[name]",
  },
  resolve: {
    extensions: [".js", ".vue", ".json"],
    alias: {
      vue$: "vue/dist/vue.esm.js",
      "@": resolve("src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          extractCSS: true,
          loaders: {
            ...cssLoaders(),
            js: { loader: "babel-loader" },
          },
          transformToRequire: {
            video: "src",
            source: "src",
            img: "src",
            image: "xlink:href",
          },
        },
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: [
          path.join(rootDir, "src"),
          // https://github.com/sagalbot/vue-select/issues/71#issuecomment-229453096
          path.join(rootDir, "node_modules", "@tronscan", "client", "src"),
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "img/[name].[hash:7].[ext]",
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "media/[name].[hash:7].[ext]",
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "fonts/[name].[hash:7].[ext]",
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(["*"], { root: path.join(rootDir, "dist") }),
    // Customize your extension structure.
    htmlPage("OneWallet", "popup", ["vendor", "popup"]),
    // End customize
    new CopyWebpackPlugin([
      { from: path.join(rootDir, "static"), ignore: ["*.DS_Store"] },
    ]),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: function(module) {
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(path.join(__dirname, "../node_modules")) === 0
        );
      },
    }),
  ],
  performance: { hints: false },
};
