import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from './database.js';
import authenticateUser from './authMiddleware.js';
import * as dotenv from 'dotenv';  // Correct import syntax
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your_simple_secret_key'; // Change this in production

// User registration
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get flights
app.get('/api/flights', async (req, res) => {
  try {
    const { departure_city, arrival_city, date } = req.query;
    let query = 'SELECT * FROM flights';
    const params = [];
    
    if (departure_city) {
      query += ' WHERE departure_city = ?';
      params.push(departure_city);
    }
    if (arrival_city) {
      query += params.length ? ' AND arrival_city = ?' : ' WHERE arrival_city = ?';
      params.push(arrival_city);
    }
    if (date) {
      query += params.length ? ' AND DATE(departure_time) = ?' : ' WHERE DATE(departure_time) = ?';
      params.push(date);
    }
    
    const [flights] = await pool.execute(query, params);
    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get hotels
app.get('/api/hotels', async (req, res) => {
  try {
    const { city } = req.query;
    let query = 'SELECT * FROM hotels';
    const params = [];
    
    if (city) {
      query += ' WHERE city = ?';
      params.push(city);
    }
    
    const [hotels] = await pool.execute(query, params);
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
// Reviews API
app.get('/api/reviews', async (req, res) => {
  try {
    const { hotelId } = req.query;
    const reviews = await db.query(`
      SELECT r.*, u.name as user_name 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.hotel_id = ?
      ORDER BY r.created_at DESC
    `, [hotelId]);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', authenticateUser, async (req, res) => {
  try {
    const { hotelId, rating, comment } = req.body;
    const review = await db.query(
      'INSERT INTO reviews (hotel_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [hotelId, req.user.id, rating, comment]
    );
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bookings API
app.post('/api/bookings', authenticateUser, async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, guests, rooms } = req.body;
    const hotel = await db.query('SELECT price FROM hotels WHERE id = ?', [hotelId]);
    const totalPrice = hotel.price * rooms;
    
    const booking = await db.query(
      `INSERT INTO bookings 
      (hotel_id, user_id, check_in, check_out, guests, rooms, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [hotelId, req.user.id, checkIn, checkOut, guests, rooms, totalPrice]
    );
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));