const express = require('express');
const router = express.Router();
const ticketsController = require('./controller');

// Ticket creation and retrieval
router.post('/api/v1/tickets', ticketsController.createTicket);
router.get('/api/v1/tickets', ticketsController.getTickets);
router.get('/api/v1/tickets/:id', ticketsController.getTicketById);

// Ticket updates
router.put('/api/v1/tickets/:id', ticketsController.updateTicketStatus);

// Responses to a ticket
router.post('/api/v1/tickets/:ticketId/responses', ticketsController.createResponse);
router.get('/api/v1/tickets/:ticketId/responses', ticketsController.getResponsesForTicket);

module.exports = router;
