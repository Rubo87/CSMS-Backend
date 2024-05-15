import express from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from "../client.js";
import { jwtTokens } from '../utils/jwt-helpers.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) return res.status(401).json({ error: "Email is incorrect" });

        const isValidPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!isValidPassword) return res.status(401).json({ error: "Password is incorrect" });

        // Generate JWT token
        const accessToken = jwt.sign({ userId: user.rows[0].id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/refresh_token', (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        // console.log(refreshToken);
        if(refreshToken === null) return res.status(401).json({ error: 'Null refresh token'});
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
            if(error) return res.status(403).json({ error: error.message });
            let tokens = jwtTokens(user);
            res.cookie('refresh_token', tokens.refreshToken, {
                httpOnly: true
            });
            res.json(tokens);
        });
    } catch (error) {
        res.status(401).json({error : error.message});
    }
});

router.delete('/refresh_token', (req, res) => {
    try {   
        res.clearCookie('refresh_token');
        return res.status(200).json({ message: 'Refresh token deleted.' })
    } catch (error) {
        res.status(401).json({error : error.message});
    }
})

export default router;