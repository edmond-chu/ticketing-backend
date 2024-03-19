require('dotenv').config();
const { Pool } = require('pg');
const connectionString = 'YourPostgresConnectionStringHere'; // Adjust this accordingly

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "postgres",
    port: 5432, // Default PostgreSQL port
  });


// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl: {
//         rejectUnauthorized: false, // Note: For secure production setups, provide the CA certificate.
//     },
//   });

console.log(process.env.DATABASE_URL);
  
const initTableScript = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    email VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);
`;


async function initializeDb() {
  try {
    await pool.query(initTableScript);
    console.log('Database table initialization check complete');
  } catch (err) {
    console.error('Error during database table initialization:', err);
  }
}

module.exports = {initializeDb, pool};