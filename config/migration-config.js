module.exports = {
  "development": {
    "url": "postgres://postgres:postgres@localhost:5432/sisdia-dev",
    "dialect": "postgres"
  },
  "production": {
    "url": process.env.DATABASE_URL,
    "dialect": "postgres"
  },
  "stage": {
    "url": process.env.DATABASE_URL,
    "dialect": "postgres"
  }
}
