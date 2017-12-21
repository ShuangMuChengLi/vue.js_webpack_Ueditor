var log4js = require('log4js');
var express = require('express');
var webpack = require("webpack");
var path = require('path');
var favicon = require('serve-favicon');
var url = require('url');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var getData = require('./routes/getData');
var webpackConfig = require("./webpack.dev.config.js");

var app = express();
var log = log4js.getLogger("app");
var compiler = webpack(webpackConfig);
compiler.apply(new webpack.ProgressPlugin(function(percentage, msg) {
  console.log(parseInt(percentage * 100) + '%', msg);
}));
app.use(require("webpack-dev-middleware")(compiler, {
  noInfo: true,
  publicPath: webpackConfig.output.publicPath // 大部分情况下和 `output.publicPath`相同
}));
app.use(require('webpack-hot-middleware')(compiler,{
  log: false
}));

app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));


app.use('/json', getData);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found' + req.url);
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  log.error("Something went wrong:", err);
  res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
  var resule = {
      status:err.code,
      msg:err.message,
  };
  res.end(JSON.stringify(resule));
});

module.exports = app;
