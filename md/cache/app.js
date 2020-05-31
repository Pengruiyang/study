var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const CryptoJS = require('crypto-js/crypto-js');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const options = {
  etag: true, //
  lastModified: false,
  setHeaders: (res,path, stat) => {
    // 只通过 etag 判断
    const data = fs.readFileSync(path,'utf-8')
    const hash = CryptoJS.MD5((JSON.stringify(data))); 
    res.set("Cache-Control","max-age=0"),
    res.set("Pragma","no-cache"),
    res.set("ETag",hash)// 手动设置Etag值为MD5加密后的hash值
  }
}
app.use(express.static(path.join(__dirname, 'public'),options));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
