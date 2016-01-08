var express = require('express'),
  config = require('./config/config'),
  db = require('./app/models');

var app = express();

var port = process.env.PORT || config.port;

require('./config/express')(app, config);

db.sequelize
  .sync({force: config.dropTables || false})
  .then(function () {
    app.listen(port, function () {
      console.log('Escutando na porta ' + port);
    });
  }).catch(function (e) {
    throw new Error(e);
  });
