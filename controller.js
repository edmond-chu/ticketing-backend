const { pool } = require('./db-handler');
const { v4: uuidv4 } = require('uuid');

exports.createTicket = async (req, res) => {
    const { name, email, description, status = 'new' } = req.body;
    const id = uuidv4();
    try {
        const result = await pool.query(
            "INSERT INTO tickets (id, name, email, description, status) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
            [id, name, email, description, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Failed to create ticket:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getTickets = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM tickets WHERE LOWER(status) != LOWER('resolved')");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Failed to retrieve tickets:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getTicketById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM tickets WHERE id = $1;", [id]);
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: "Ticket not found" });
        }
    } catch (error) {
        console.error('Failed to retrieve ticket:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.updateTicketStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['in progress', 'resolved'].includes(status.toLowerCase())) {
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
            res.status(404).json({ message: "Ticket not found" });
        }
    } catch (error) {
        console.error('Failed to update ticket status:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.createResponse = async (req, res) => {
    const { ticketId } = req.params;
    const { description } = req.body;

    try {
        const ticketCheckResult = await pool.query('SELECT 1 FROM tickets WHERE id = $1', [ticketId]);
        if (ticketCheckResult.rowCount === 0) {
            res.status(404).json({ message: 'Ticket not found' });
        } else {
            const insertResult = await pool.query(
                'INSERT INTO responses (ticket_id, description) VALUES ($1, $2) RETURNING *;',
                [ticketId, description]
            );
            res.status(201).json(insertResult.rows[0]);
        }
    } catch (error) {
        console.error('Failed to create response:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getResponsesForTicket = async (req, res) => {
    const { ticketId } = req.params;
    try {
        const queryResult = await pool.query(
            'SELECT * FROM responses WHERE ticket_id = $1',
            [ticketId]
        );
        if (queryResult.rows.length > 0) {
            res.status(200).json(queryResult.rows);
        } else {
            res.status(200).json({ message: "No responses found for this ticket" });
        }
    } catch (error) {
        console.error('Error fetching responses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
