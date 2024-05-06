const express = require('express');
const app = express();
const pool = require('./client.js');
const port = process.env.PORT;
const usersRouter = require('./routes/users_routes');
const cors = require('cors');
const { authenticateToken } = require('./middleware/authorization.js');

// Enable CORS for all origins
app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Homepage');
});

app.get('/secure-route', authenticateToken, (req, res) => {
    // This route is protected by authentication middleware
    // Only authenticated users can access it
    res.send('Welcome to the secure route');
});

app.use('/users', usersRouter); // Mount usersRouter at '/users' base path

app.get('/api/language-schools', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM language_schools');
        const data = result.rows;
        res.json(data);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});