process.env.PWD = process.cwd();

var path = require('path'),
  rootPath = process.env.PWD,
  env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'sisdia'
    },
    dumpSql: true,
    port: 3500,
    db: 'postgres://postgres:postgres@localhost:5432/sisdia-dev'
  },

  test: {
    root: rootPath,
    app: {
      name: 'sisdia'
    },
    dropTables: true,
    port: 3500,
    db: 'postgres://postgres:postgres@localhost:5432/sisdia-test'
  },

  stage: {
    root: rootPath,
    app: {
      name: 'sisdia'
    },
    dropTables: false,
    port: 8080,
    db: process.env.DATABASE_URL
  },

  production: {
    root: rootPath,
    app: {
      name: 'sisdia'
    },
    port: 443,
    db: 'postgres://gnzeglgh:q0Ur3_VJ_PQD1HDghjyVGWbBhrUMKGLg@qdjjtnkv.db.elephantsql.com:5432/gnzeglgh'
  }
};

module.exports = config[env];
