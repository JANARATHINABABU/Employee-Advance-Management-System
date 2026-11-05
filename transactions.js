const express = require('express');
const router = express.Router();

let transactions = [];

router.get('/', (req, res) => res.json(transactions));

router.post('/', (req, res) => {
    const tx = { id: transactions.length + 1, ...req.body };
    transactions.push(tx);
    res.status(201).json(tx);
});

module.exports = router;