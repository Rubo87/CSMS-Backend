const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../client.js');
const { getData } = require('../shared/controllers.js');
const { getUsersQuery } = require('../shared/queries.js');
const { authenticateToken } = require('../middleware/authorization.js');

const router = express.Router();

router.get('/',  (req, res) => {
    getData(req, res, getUsersQuery);
});

router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Query the database to find the user by their email
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        // If no user is found with the provided email, return an error
        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare the provided password with the hashed password stored in the database
        const match = await bcrypt.compare(password, user.rows[0].password);

        // If the passwords don't match, return an error
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // If the passwords match, return the user data
        res.json({ user: user.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/api/', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = await pool.query('INSERT INTO users (username, email, password, name, surname, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [req.body.username, req.body.email, hashedPassword, req.body.name, req.body.surname, req.body.role]);

        res.json({
            user: newUser.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;