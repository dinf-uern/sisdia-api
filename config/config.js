process.env.PWD = process.cwd();

var path = require('path'),
  rootPath = process.env.PWD,
  env = process.env.NODE_ENV || 'development',
  db = process.env.DATABASE_URL;

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'sisdia'
    },
    dumpSql: true,
    port: 3500,
    db: db
  },

  test: {
    root: rootPath,
    app: {
      name: 'sisdia'
    },
    dropTables: true,
    port: 3500,
    db: db
  },

  stage: {
    root: rootPath,
    app: {
      name: 'sisdia'
    },
    dropTables: false,
    port: 8080,
    db: db
  },

  production: {
    root: rootPath,
    app: {
      name: 'sisdia'
    },
    port: 443,
    db: db
  }
};

module.exports = config[env];
