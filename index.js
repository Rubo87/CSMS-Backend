const express = require('express');
const app = express();
const pool = require('./client.js');
const port = process.env.PORT;
const usersRouter = require('./routes/users_routes');
/* const schoolsRouter = require('./routes/schools_routes'); */
const cors = require('cors');
const { authenticateToken } = require('./middleware/authorization.js');
const bcrypt = require('bcrypt');
const exceljs = require('exceljs');

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
  
      console.log('Received event data:', req.body);
  
      // Validate the event type
      if (!['high', 'medium', 'low'].includes(event_type.toLowerCase())) {
        return res.status(400).json({ error: 'Invalid event type' });
      }
  
      // Insert the new event
      const newEntry = await pool.query(
        'INSERT INTO events (title, event_date, event_time, event_type) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, event_date, event_time, event_type.toLowerCase()]
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

app.get('/api/export-excel', async (req, res) => {
    try {
      // Fetch data from the database table
      const { rows } = await pool.query('SELECT * FROM language_schools');
  
      // Create a new workbook
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet('Language Schools');
  
      // Define column headers
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Users', key: 'users', width: 15 },
        { header: 'Year', key: 'year', width: 10 },
        { header: 'Country', key: 'country', width: 20 },
        { header: 'First Name', key: 'firstname', width: 20 },
        { header: 'Last Name', key: 'lastname', width: 20 },
        { header: 'City', key: 'city', width: 20 },
        { header: 'Class', key: 'class', width: 10 },
        { header: 'Company Name', key: 'companyname', width: 25 },
      ];
  
      // Add data rows
      worksheet.addRows(rows);
  
      // Set response headers for Excel file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=language_schools.xlsx');
  
      // Write Excel file to response
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error exporting data to Excel:', error);
      res.status(500).send('Internal Server Error');
    }
  });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});