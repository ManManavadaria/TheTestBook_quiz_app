const http = require('http');
const app = require('./app');
const conn = require('./db/db');

// Load environment variables
require('dotenv').config();


conn()
// Get the port from environment variables or default to 3000
const PORT = process.env.PORT || 3000;

// Create an HTTP server and pass the app
const server = http.createServer(app);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
