const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { initializeDb } = require("./db-handler"); 
const routes = require("./route"); // Import routes

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Initialize database tables
initializeDb()
  .then(() => {
    console.log('Database initialization successful');
  })
  .catch(err => {
    console.error("Failed to initialize database:", err);
    process.exit(1); // Exit in case of database initialization failure
  });

// Routes
app.use(routes);

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
