/* // Import required modules
const express = require('express');
const router = express.Router();
const { pool } = require('../client.js'); // Import your PostgreSQL client

// Route to handle POST requests to create a new entry
router.post('/language-schools', async (req, res) => {
    try {
        // Extract data from the request body
        const { classValue, companyName, users, firstName, lastName, city, country } = req.body;

        // Insert data into the database
        const newEntry = await pool.query(
            'INSERT INTO language_schools (class, companyname, users, firstname, lastname, city, country) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [classValue, companyName, users, firstName, lastName, city, country, id]
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

module.exports = router;
 */