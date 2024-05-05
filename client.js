const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL ,
})

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error connecting to the database:', err);
  }
  console.log('Connected to PostgreSQL database successfully');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
