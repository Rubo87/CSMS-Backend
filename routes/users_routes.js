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
        const { email, password, username, name, surname, role } = req.body;

        // Check if the request contains the "email" field to determine if it's a login or signup request
        if (email && password) {
            // This is a login request
            const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

            if (user.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const match = await bcrypt.compare(password, user.rows[0].password);

            if (!match) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            return res.json({ user: user.rows[0] });
        } else {
            // This is a signup request
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await pool.query('INSERT INTO users (username, email, password, name, surname, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [username, email, hashedPassword, name, surname, role]);

            return res.json({ user: newUser.rows[0] });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;