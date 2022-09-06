const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const BASE_PATH = './src/client/js/';

module.exports = {
  entry: {
    main: BASE_PATH + 'main.js',
    toggleNavbar: BASE_PATH + 'toggleNavbar.js',
    videoPlayer: BASE_PATH + 'videoPlayer.js',
    comments: BASE_PATH + 'comments.js',
    loggedInComments: BASE_PATH + 'loggedInComments.js',
  },
  mode: 'development',
  watch: true,
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/style.css',
    }),
  ],
  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, 'assets'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', { targets: 'defaults' }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
};
