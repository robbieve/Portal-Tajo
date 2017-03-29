const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');

const PROJECT = process.env.DRVR_PROJECT;

module.exports = require('./webpack.base')({
  // skip all hot-reloading stuff
  entry: [
    path.join(process.cwd(), `src/projects/${PROJECT}`),
  ],

  output: {
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js',
    // add this path to static files in index.html
    publicPath: '',
  },

  // where compile locally
  outputFolder: path.resolve(process.cwd(), `builds/dev/${PROJECT}`),

  plugins: [

    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: true, // Inject all files that are generated by webpack, e.g. bundle.js
    }),

    // Extract the CSS into a seperate file
    // new ExtractTextPlugin('css/[name].[contenthash].css'),
  ],
});
