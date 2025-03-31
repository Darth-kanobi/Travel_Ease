import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from './database.js';
import authenticateUser from './authMiddleware.js';
import * as dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your_secure_secret_key';

// User registration
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ 
      id: user.id, 
      email: user.email,
      name: user.name
    }, JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get flights
app.get('/api/flights', async (req, res) => {
  try {
    const { departure_city, arrival_city, date } = req.query;
    let query = 'SELECT * FROM flights WHERE 1=1';
    const params = [];
    
    if (departure_city) {
      query += ' AND departure_city = ?';
      params.push(departure_city);
    }
    if (arrival_city) {
      query += ' AND arrival_city = ?';
      params.push(arrival_city);
    }
    if (date) {
      query += ' AND DATE(departure_time) = ?';
      params.push(date);
    }
    
    query += ' ORDER BY departure_time ASC';
    
    const [flights] = await pool.execute(query, params);
    res.json(flights);
  } catch (err) {
    console.error('Flights error:', err);
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
});

// Hotels endpoints
app.get('/api/hotels', async (req, res) => {
  try {
    const { city } = req.query;
    let query = 'SELECT * FROM hotels';
    const params = [];
    
    if (city) {
      query += ' WHERE city = ?';
      params.push(city);
    }
    
    query += ' ORDER BY rating DESC';
    
    const [hotels] = await pool.execute(query, params);
    res.json(hotels);
  } catch (err) {
    console.error('Hotels error:', err);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
});

app.get('/api/hotels/:id', async (req, res) => {
  try {
    const [hotels] = await pool.execute('SELECT * FROM hotels WHERE id = ?', [req.params.id]);
    
    if (hotels.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    res.json(hotels[0]);
  } catch (err) {
    console.error('Hotel details error:', err);
    res.status(500).json({ error: 'Failed to fetch hotel details' });
  }
});

// Reviews endpoints
app.get('/api/reviews', async (req, res) => {
  try {
    const { hotelId } = req.query;
    
    if (!hotelId) {
      return res.status(400).json({ error: 'hotelId parameter is required' });
    }

    const [reviews] = await pool.execute(`
      SELECT r.*, u.name as user_name 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.hotel_id = ?
      ORDER BY r.created_at DESC
    `, [hotelId]);
    
    res.json(reviews);
  } catch (err) {
    console.error('Reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/reviews', authenticateUser, async (req, res) => {
  try {
    const { hotelId, rating, comment } = req.body;
    
    // Validate input
    if (!hotelId || !rating || !comment) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify hotel exists
    const [hotels] = await pool.execute('SELECT id FROM hotels WHERE id = ?', [hotelId]);
    if (hotels.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const [result] = await pool.execute(
      'INSERT INTO reviews (hotel_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [hotelId, req.user.id, rating, comment]
    );
    
    // Get the full review with user info
    const [newReview] = await pool.execute(`
      SELECT r.*, u.name as user_name 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [result.insertId]);
    
    res.status(201).json(newReview[0]);
  } catch (err) {
    console.error('Review submission error:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Bookings API
app.post('/api/bookings', authenticateUser, async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, guests, rooms } = req.body;
    
    // Validate input
    if (!hotelId || !checkIn || !checkOut || !guests || !rooms) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify hotel exists and get price
    const [hotels] = await pool.execute('SELECT price FROM hotels WHERE id = ?', [hotelId]);
    if (hotels.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const totalPrice = hotels[0].price * rooms;
    
    const [result] = await pool.execute(
      `INSERT INTO bookings 
      (hotel_id, user_id, check_in, check_out, guests, rooms, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [hotelId, req.user.id, checkIn, checkOut, guests, rooms, totalPrice]
    );
    
    // Get the full booking details
    const [booking] = await pool.execute(`
      SELECT b.*, h.name as hotel_name, h.location as hotel_location
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      WHERE b.id = ?
    `, [result.insertId]);
    
    res.status(201).json(booking[0]);
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));