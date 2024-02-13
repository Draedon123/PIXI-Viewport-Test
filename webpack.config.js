const path = require("path");

module.exports = {
  mode: "production",
  entry: "./ts/script.ts",
  output: {
    filename: "script.js",
    path: path.resolve(__dirname, "js"),
  },
  target: ["web"],
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      }
    ]
  },
  optimization: {
    minimize: false,
  }
}