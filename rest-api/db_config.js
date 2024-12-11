import 'dotenv/config'

export default {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
  // debug: true,
  pool: { min: 5, max: 20 },
  acquireConnectionTimeout: 60000,
};