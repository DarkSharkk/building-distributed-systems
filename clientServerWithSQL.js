const express = require('express');
const sqlite3 = require('better-sqlite3');

const app = express();
const db = sqlite3('numbers.db')
app.use(express.json());

db.prepare(`
    CREATE TABLE IF NOT EXISTS processed_numbers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number INTEGER NOT NULL UNIQUE
    )   
`).run();

let lastProcessedNumber = db.prepare(`
    SELECT MAX(number) AS maxNumber FROM processed_numbers    
`).get().maxNumber || null;

const ERROR_ALREADY_PROCESSED = 'Number already processed';
const ERROR_SEQUENCE_ISSUE = 'Number is one less than already processed';

const processNumber = (number) => {
    const exists = db.prepare(`
        SELECT COUNT(*) AS count FROM processed_numbers WHERE number = ?
      `).get(number).count > 0;
    
      if (exists) {
        throw new Error(ERROR_ALREADY_PROCESSED);
      }
    
      if (lastProcessedNumber !== null && number === lastProcessedNumber - 2) {
        throw new Error(ERROR_SEQUENCE_ISSUE);
      }
    
      db.prepare(`
        INSERT INTO processed_numbers (number) VALUES (?)
      `).run(number);
    
      lastProcessedNumber = number + 1;
    
      return number + 1;
};

app.post('/process', (req, res) => {
    const { number } = req.body;

    if (typeof number !== 'number' || number < 0) {
        return res.status(400).send({ error: "Invalid input" });
    }

    try {
        const result = processNumber(number);

        return res.status(200).send({ result });
    } catch (error) {
        console.error(`Error: ${error.message}`);

        return res.status(400).send({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
}); 
