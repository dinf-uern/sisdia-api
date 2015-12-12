var express = require('express'),
  config = require('./config/config'),
  db = require('./app/models');

var app = express();

require('./config/express')(app, config);

var port = (process.env.VCAP_APP_PORT || config.port);
var host = (process.env.VCAP_APP_HOST || 'localhost');

db.sequelize
  .sync({force: config.dropTables || false})
  .then(function () {
    app.listen(port, host, function () {
      console.log('Escutando na porta ' + port);
    });
  }).catch(function (e) {
    throw new Error(e);
  });
