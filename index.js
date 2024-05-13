const express = require('express');
const app = express();
const pool = require('./client.js');
const port = process.env.PORT;
const usersRouter = require('./routes/users_routes');
/* const schoolsRouter = require('./routes/schools_routes'); */
const cors = require('cors');
const { authenticateToken } = require('./middleware/authorization.js');

// Enable CORS for all origins
app.use(cors());

app.use(express.json());

/* app.use('/api/language-schools', schoolsRouter); */

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

app.post('/api/language-schools', async (req, res) => {
    try {
        // Extract data from the request body
        const { classValue, companyName, users, firstName, lastName, city, country } = req.body;

        // Insert data into the database
        const newEntry = await pool.query(
            'INSERT INTO language_schools (class, companyname, users, firstname, lastname, city, country) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [classValue, companyName, users, firstName, lastName, city, country]
        );

        // Send success response with the newly created entry
        res.status(201).json({
            success: true,
            message: 'New entry created successfully',
            entry: newEntry.rows[0]
        });
    } catch (error) {
        // Handle errors
        console.error('Error creating new entry:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

app.delete('/api/language-schools/:id', async (req, res) => {
    const id = req.params.id;
    try {
        // Perform deletion operation here using the id
        // For example, you can execute a DELETE query in your database
        await pool.query('DELETE FROM language_schools WHERE id = $1', [id]);
        res.status(204).send(); // No content, successful deletion
    } catch (err) {
        console.error('Error executing delete query', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/language-schools/:id', async (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    try {
        const { classValue, companyName, users, firstName, lastName, city, country } = updatedData;
        const result = await pool.query(
            'UPDATE language_schools SET "class" = $1, companyname = $2, users = $3, firstname = $4, lastname = $5, city = $6, country = $7 WHERE id = $8',
            [classValue, companyName, users, firstName, lastName, city, country, id]
        );
        if (result.rowCount === 1) {
            res.status(200).json({ message: 'Data updated successfully' });
        } else {
            res.status(404).json({ error: 'Data not found' });
        }
    } catch (err) {
        console.error('Error updating data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/calendar-events', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events');
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