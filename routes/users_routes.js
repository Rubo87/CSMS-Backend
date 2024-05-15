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