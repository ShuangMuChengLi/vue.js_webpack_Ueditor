var path = require('path');
var webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.config.js');
var BUILD_PATH = path.resolve(__dirname, 'dist');
var ROOT_PATH = path.resolve(__dirname, 'public');
var CSS_PATH = path.resolve(ROOT_PATH, 'css');
var postcssConfig = require('./postcss.config');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractLESS = new ExtractTextPlugin('stylesheets/[name].less.css');
const extractCSS = new ExtractTextPlugin('stylesheets/[name].css');
module.exports =a =  webpackMerge(commonConfig, {
  // entry: {
  //   vendor:['vue/dist/vue.common.js','vue-resource','vue-router',
  //     'moment','element-ui',path.resolve(ROOT_PATH, 'ueditor','ueditor.all.js','lodash')]
  // },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: extractCSS.extract([ 'css-loader', 'postcss-loader' ])
      },
      {
        test: /\.less$/,
        use: extractLESS.extract([ 'css-loader', {
          loader: 'postcss-loader',
          options: {
            plugins: postcssConfig.plugins
          }
        }, 'less-loader' ]),
        include: CSS_PATH
      }
    ]
  },
  //输出的文件名 合并以后的js会命名为bundle.js
  output: {
    path: BUILD_PATH,
    publicPath:"/",
    filename: "[name].bundle.js"
  },
  plugins: [
    extractCSS,
    extractLESS
    // new webpack.NoErrorsPlugin()
  ]
})