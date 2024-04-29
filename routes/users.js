const express = require('express');
const router = express.Router();
const pool = require('../client.js'); // Import the PostgreSQL pool

// Route to get the complete list of pokemon from the database
/* router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}); */

// Define a route
router.get('/', (req, res) => {
    res.send('Hello World!');
  });

module.exports = router;

