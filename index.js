const express = require('express');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
    user: 'user',
    host: 'localhost',
    database: 'nums',
    password: 'root',
    port: 5432,
});

app.use(express.json());

const createTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS processed_numbers (
            id SERIAL PRIMARY KEY,
            number INTEGER NOT NULL UNIQUE
        )
    `);
};

createTable();

let lastProcessedNumber = null;

const ERROR_ALREADY_PROCESSED = 'Number already processed';
const ERROR_SEQUENCE_ISSUE = 'Number is one less than already processed';

const processNumber = async (number) => {
    const { rows } = await pool.query(`
        SELECT COUNT(*) AS count FROM processed_numbers WHERE number = $1
    `, [number]);

    const exists = rows[0].count > 0;

    if (exists) {
        throw new Error(ERROR_ALREADY_PROCESSED);
    }

    if (lastProcessedNumber !== null && number === lastProcessedNumber - 2) {
        throw new Error(ERROR_SEQUENCE_ISSUE);
    }

    await pool.query(`
        INSERT INTO processed_numbers (number) VALUES ($1)
    `, [number]);

    lastProcessedNumber = number + 1;

    return number + 1;
};

app.post('/process', async (req, res) => {
    const { number } = req.body;

    if (typeof number !== 'number' || number < 0) {
        return res.status(400).send({ error: "Invalid input" });
    }

    try {
        const result = await processNumber(number);
        return res.status(200).send({ result });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return res.status(400).send({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
