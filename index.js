const express = require('express');
const app = express();
const pool = require('./client.js');
const port = process.env.PORT;
const usersRouter = require('./routes/users_routes');
/* const schoolsRouter = require('./routes/schools_routes'); */
const cors = require('cors');
const { authenticateToken } = require('./middleware/authorization.js');
const bcrypt = require('bcrypt');

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
        'UPDATE language_schools SET "class" = $1, companyname = $2, users = $3, firstname = $4, lastname = $5, city = $6, country = $7 WHERE id = $8 RETURNING *',
        [classValue, companyName, users, firstName, lastName, city, country, id]
      );
      if (result.rowCount === 1) {
        res.status(200).json(result.rows[0]); // Send back the updated row data
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
        const result = await pool.query('SELECT * FROM calendar_events');
        const data = result.rows;
        res.json(data);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add a new event
app.post('/api/calendar-events', async (req, res) => {
    try {
        const { title, event_date, event_time, event_type } = req.body;
        const result = await pool.query(
            'INSERT INTO calendar_events (title, event_date, event_time, event_type) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, event_date, event_time, event_type]
        );
        const newEvent = result.rows[0];
        res.status(201).json(newEvent);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update an existing event
app.put('/api/calendar-events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, event_date, event_time, event_type } = req.body;
        const result = await pool.query(
            'UPDATE calendar_events SET title = $1, event_date = $2, event_time = $3, event_type = $4 WHERE id = $5 RETURNING *',
            [title, event_date, event_time, event_type, id]
        );
        const updatedEvent = result.rows[0];
        res.json(updatedEvent);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete an event
app.delete('/api/calendar-events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM calendar_events WHERE id = $1', [id]);
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
  

app.post('/users/new', async (req, res) => {
    try {
        const { username, email, password, name, surname, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password, name, surname, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [username, email, hashedPassword, name, surname, role]
        );

        res.json({
            user: newUser.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});