const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: "development",
  devtool: 'inline-source-map',
  devServer: {
    publicPath: '/',
    port: 9000,
    contentBase: path.join(__dirname, './src'),
    host: '127.0.0.1',
    hot: true,
  },
  module: {
    rules: [
      {
        include: [path.resolve(__dirname, './src')],
        exclude: /node_modules/,
        loader: 'eslint-loader',
        test: /\.js$/,
      },
    ],
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].[hash].bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
}