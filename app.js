const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid"); 
const {initializeDb, pool} = require("./db-handler"); 

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Initialize database tables
initializeDb().then(() => {
  const PORT = process.env.PORT || 5002; 
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize database:", err);
  process.exit(1); 
});


//create response
app.post('/api/v1/tickets/:ticketId/responses', async (req, res) => {
  const { ticketId } = req.params;
  const { description } = req.body;

  try {
      // First, check if the specified ticket exists
      const ticketCheckResult = await pool.query('SELECT 1 FROM tickets WHERE id = $1', [ticketId]);
      if (ticketCheckResult.rowCount === 0) {
          // If the ticket does not exist, return a 404 error
          res.status(404).json({ message: 'Ticket not found' });

      }

      // If the ticket exists, insert the new response
      const insertResult = await pool.query(
          'INSERT INTO responses (ticket_id, description) VALUES ($1, $2) RETURNING *;',
          [ticketId, description]
      );  
      console.log("Lookup ticketId: "+ ticketId +" and notify via email");
      // Return the newly created response
      res.status(201).json(insertResult.rows[0]);
  } catch (error) {
      console.error('Failed to create response:', error);
      res.status(500).json({ error: "Internal server error" });
  }
});
//Get responses
app.get('/api/v1/tickets/:ticketId/responses', async (req, res) => {
    const { ticketId } = req.params;

    try {
        // Query to select all responses for the specified ticket ID
        const queryResult = await pool.query(
            'SELECT * FROM responses WHERE ticket_id = $1',
            [ticketId]
        );

        // If responses exist, send them back to the client
        if (queryResult.rows.length > 0) {
            res.status(200).json(queryResult.rows);
        } else {
            // If no responses are found, return a message indicating so
            res.status(200).json([]);
        }
    } catch (error) {
        console.error('Error fetching responses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// POST /api/v1/tickets - Create a new ticket
app.post("/api/v1/tickets", async (req, res) => {
  const { name, email, description, status = 'new' } = req.body;
  const id = uuidv4(); // Generate a new UUID for this ticket
  try {
      const result = await pool.query(
          "INSERT INTO tickets (id, name, email, description, status) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
          [id, name, email, description, status]
      );
      res.status(201).json(result.rows[0]);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/v1/tickets - Retrieve all tickets
app.get("/api/v1/tickets", async (req, res) => {
  try {
      const result = await pool.query("SELECT * FROM tickets WHERE status ILIKE 'resolved'");
      res.status(200).json(result.rows);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/v1/tickets/:id - Retrieve a single ticket by ID
app.get("/api/v1/tickets/:id", async (req, res) => {
  const { id } = req.params;
  try {
      const result = await pool.query("SELECT * FROM tickets WHERE id = $1;", [id]);
      if (result.rows.length > 0) {
          res.status(200).json(result.rows[0]);
      } else {
          res.status(404).json({ message: "Ticket not found" });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/v1/tickets/:id - Update a ticket's status to "in progress" or "resolved"
app.put("/api/v1/tickets/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate the status field
  if (!['in progress', 'resolved'].includes(status.toLowerCase())) {
      // If status is not one of the allowed values, return a 400 Bad Request response
      return res.status(400).json({ error: "Status is invalid" });
  }

  try {
      const result = await pool.query(
          "UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *;",
          [status, id]
      );
      if (result.rows.length > 0) {
          res.status(200).json(result.rows[0]);
      } else {
          // If the ticket with the specified ID does not exist, return a 404 Not Found response
          res.status(404).json({ message: "Ticket not found" });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
  }
});


