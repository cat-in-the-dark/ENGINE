const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: path.join(__dirname, "src", "example", "public"),
  },
  context: path.join(__dirname, "src"),
  entry: "./example/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./example/index.html",
      minify: {
        collapseWhitespace: true,
      },
    }),
  ],
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "src", "example", "public"),
    clean: false,
  },
};