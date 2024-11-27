const express = require('express');
const app = express();
app.use(express.json());

const database = new Set();
let lastProcessedNumber = null;

const ERROR_ALREADY_PROCESSED = 'Number already processed';
const ERROR_SEQUENCE_ISSUE = 'Number is one less than already processed';

const processNumber = (number) => {
    if (database.has(number)) {
        throw new Error(ERROR_ALREADY_PROCESSED);
    }

    if (lastProcessedNumber !== null && number === lastProcessedNumber - 2) {
        throw new Error(ERROR_SEQUENCE_ISSUE);
    }

    database.add(number);
    
    let resultNumber = number + 1;
    lastProcessedNumber = resultNumber;
    
    return resultNumber;
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
