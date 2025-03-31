const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    
    // First get city codes
    const [fromCities] = await db.query('SELECT code FROM cities WHERE name = ?', [from]);
    const [toCities] = await db.query('SELECT code FROM cities WHERE name = ?', [to]);
    
    if (fromCities.length === 0 || toCities.length === 0) {
      return res.status(400).json({ error: 'Invalid city selection' });
    }

    const fromCode = fromCities[0].code;
    const toCode = toCities[0].code;

    const [flights] = await db.query(
      `SELECT * FROM flights 
       WHERE from_code = ? AND to_code = ? 
       AND DATE(departure_time) = ?`,
      [fromCode, toCode, date]
    );
    
    res.json(flights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;