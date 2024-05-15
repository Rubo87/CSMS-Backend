const express = require('express');
const app = express();
const pool = require('./client.js');
const port = process.env.PORT;
const usersRouter = require('./routes/users_routes');
/* const schoolsRouter = require('./routes/schools_routes'); */
const cors = require('cors');
const { authenticateToken } = require('./middleware/authorization.js');


app.use(cors());

app.use(express.json());


app.get('/', (req, res) => {
    res.send('Homepage');
});

app.get('/secure-route', authenticateToken, (req, res) => {

    res.send('Welcome to the secure route');
});

app.use('/users', usersRouter); 

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

        const { classValue, companyName, users, firstName, lastName, city, country } = req.body;


        const newEntry = await pool.query(
            'INSERT INTO language_schools (class, companyname, users, firstname, lastname, city, country) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [classValue, companyName, users, firstName, lastName, city, country]
        );


        res.status(201).json({
            success: true,
            message: 'New entry created successfully',
            entry: newEntry.rows[0]
        });
    } catch (error) {

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

        await pool.query('DELETE FROM language_schools WHERE id = $1', [id]);
        res.status(204).send(); 
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

app.get('/api/event-types', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM EventTypes');
        const data = result.rows;
        res.json(data);
    } catch (err) {
        console.error('Error executing query', err);
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

app.post('/api/calendar-events', async (req, res) => {
    try {
        const { title, event_date, event_time, event_type } = req.body;

        // Ensure event_type is one of 'high', 'medium', or 'low'
        if (!['high', 'medium', 'low'].includes(event_type)) {
            return res.status(400).json({ error: 'Invalid event type' });
        }

        // Insert the new event
        const newEntry = await pool.query(
            'INSERT INTO events (title, event_date, event_time, event_type) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, event_date, event_time, event_type]
        );

        res.status(201).json({
            success: true,
            message: 'New event created successfully',
            event: newEntry.rows[0]
        });
    } catch (error) {
        console.error('Error creating new event:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});






app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});