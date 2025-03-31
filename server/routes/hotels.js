const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    const [hotels] = await db.query('SELECT * FROM hotels WHERE city = ?', [city]);
    res.json(hotels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;