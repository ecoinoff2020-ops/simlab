const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function check() {
    try {
        await client.connect();
        console.log('Connected to DB');
        const res = await client.query('SELECT email, role FROM "User"');
        console.log('Users found:', res.rows);
    } catch (err) {
        console.error('Error connecting or querying:', err);
    } finally {
        await client.end();
    }
}

check();
