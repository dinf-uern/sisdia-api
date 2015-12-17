var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'buscafeira'
    },
    dumpSql: true,
    port: 3500,
    db: 'postgres://postgres:postgres@localhost:5432/sisdia-dev'
  },

  test: {
    root: rootPath,
    app: {
      name: 'buscafeira'
    },
    dropTables: true,
    port: 3500,
    db: 'postgres://postgres:postgres@localhost:5432/sisdia-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'buscafeira'
    },
    port: 443,
    db: 'postgres://gnzeglgh:q0Ur3_VJ_PQD1HDghjyVGWbBhrUMKGLg@qdjjtnkv.db.elephantsql.com:5432/gnzeglgh'
  }
};

module.exports = config[env];
