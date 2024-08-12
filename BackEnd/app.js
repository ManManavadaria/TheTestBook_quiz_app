const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// CORS configuration
app.use(cors());


// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/admin',adminRoutes);

app.get('/ping', (req, res) => {
    res.status(200).json({ message: 'pong' });
});


module.exports = app;
