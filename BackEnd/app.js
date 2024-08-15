const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.includes(origin)) {
            callback(null, true); // Allow request if origin is in the allowed list
        } else {
            callback(new Error('Not allowed by CORS')); // Block request if origin is not in the allowed list
        }
    },
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};
console.log(allowedOrigins)
console.log(corsOptions)
app.use(cors(corsOptions));
// app.use(cors());


// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/admin',adminRoutes);

module.exports = app;
