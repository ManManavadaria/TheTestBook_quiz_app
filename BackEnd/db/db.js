const mongoose = require('mongoose');

const conn = () => {
    mongoose.connect(process.env.DB_URI)
    .then((data) => {
        console.log(`Mongo connected successfully with server: ${data.connection.host}`);
    })
    .catch((error) => {
        console.error(`Error connecting to MongoDB: ${error.message}`);
    });
};

module.exports = conn;
