var express = require('express');
var router = express.Router();
var glob = require('glob');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var httpErrors = require('httperrors');
var sequelize = require('sequelize');

module.exports = function(app, config) {

  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';

  // app.use(favicon(config.root + '/public/img/favicon.ico'));
  //app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(cookieParser());
  app.use(compress());
  app.use(methodOverride());

  var routes = glob.sync(config.root + '/app/routes/*.js');

  routes.forEach(function (route) {
    require(route)(app);
  });

  app.use(function(err, req, res, next){
    var error;

    //envia para o console
    if (app.get('env') !== 'test')
      console.log(err);

    if (!err.http) {
      if (err.name === 'SequelizeValidationError') {
        error = httpErrors.BadRequest(err.message)
      } else {
        error = httpErrors.InternalServerError('Ops. Ocorreu um problema!');
      }
    } else {
      error = err;
    }

    if (app.get('env') === 'development' && err.stack)
      error.debugStack = err.stack;

    res.status(error.status).send(error);

  });



};
