const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');


// Middleware to parse JSON bodies
app.use(express.json());

app.use(session({
    secret: "process.env.SESSION_SECRET",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Set to true if using HTTPS
}));


// Middleware to log requests
// app.use(logger);

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);


module.exports = app;
