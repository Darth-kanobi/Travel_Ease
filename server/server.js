import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from './database.js';
import authenticateUser from './authMiddleware.js';
import * as dotenv from 'dotenv';

// Import Mongoose models
import User from './models/User.js';
import Flight from './models/Flight.js';
import Hotel from './models/Hotel.js';
import Review from './models/Review.js';
import Booking from './models/Booking.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your_secure_random_string';

// Connect to MongoDB
connectDB();

// User registration
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });
    
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    if (err.code === 11000) {
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

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await user.matchPassword(password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ 
      id: user._id, 
      email: user.email,
      name: user.name
    }, JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get flights from database
app.get('/api/flights', async (req, res) => {
  try {
    const { departure_city, arrival_city, date } = req.query;
    
    if (!departure_city || !arrival_city || !date) {
      return res.status(400).json({ 
        error: 'Missing required parameters: departure_city, arrival_city, and date' 
      });
    }

    // Parse target date (start and end of the day) to match MongoDB Date objects
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setUTCHours(23, 59, 59, 999));
    
    const flights = await Flight.find({
      departureCity: new RegExp(`^${departure_city}$`, 'i'),
      arrivalCity: new RegExp(`^${arrival_city}$`, 'i'),
      departureTime: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ departureTime: 1 });

    if (flights.length === 0) {
      return res.status(404).json({ 
        error: 'No flights found for the selected route and date' 
      });
    }

    // Map fields back to snake_case for the frontend structure compatibility
    const mappedFlights = flights.map(flight => ({
      id: flight._id,
      flight_number: flight.flightNumber,
      departure_city: flight.departureCity,
      arrival_city: flight.arrivalCity,
      departure_time: flight.departureTime,
      arrival_time: flight.arrivalTime,
      price: flight.price,
      seats_available: flight.seatsAvailable,
      departure_airport: flight.departureAirport,
      arrival_airport: flight.arrivalAirport,
      departure_terminal: flight.departureTerminal,
      arrival_terminal: flight.arrivalTerminal,
      airline_name: flight.airlineName
    }));

    res.json(mappedFlights);
  } catch (error) {
    console.error('Flight fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch flights',
      details: error.message
    });
  }
});

// Get hotels from database
app.get('/api/hotels', async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    const hotels = await Hotel.find({
      city: new RegExp(`^${city}$`, 'i')
    }).sort({ rating: -1 });

    const mappedHotels = hotels.map(hotel => ({
      id: hotel._id,
      name: hotel.name,
      city: hotel.city,
      location: hotel.location,
      image: hotel.image,
      rating: hotel.rating,
      price: hotel.price,
      amenities: hotel.amenities,
      description: hotel.description,
      roomsAvailable: hotel.roomsAvailable
    }));

    res.json(mappedHotels);
  } catch (err) {
    console.error('Hotels error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch hotels',
      details: err.message
    });
  }
});

// GET Single Hotel Details
app.get('/api/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid hotel ID format' });
    }

    const hotel = await Hotel.findById(id);
    
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    const mappedHotel = {
      id: hotel._id,
      name: hotel.name,
      city: hotel.city,
      location: hotel.location,
      image: hotel.image,
      rating: hotel.rating,
      price: hotel.price,
      amenities: hotel.amenities,
      description: hotel.description,
      roomsAvailable: hotel.roomsAvailable
    };

    res.json(mappedHotel);
  } catch (err) {
    console.error('Fetch hotel details error:', err);
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

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({ error: 'Invalid hotel ID format' });
    }

    const reviews = await Review.find({ hotelId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    
    const mappedReviews = reviews.map(review => ({
      id: review._id,
      hotel_id: review.hotelId,
      user_id: review.userId?._id,
      user_name: review.userId?.name || 'Anonymous',
      rating: review.rating,
      comment: review.comment,
      created_at: review.createdAt
    }));

    res.json(mappedReviews);
  } catch (err) {
    console.error('Reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/reviews', authenticateUser, async (req, res) => {
  try {
    const hotelId = req.body.hotelId || req.body.hotel_id;
    const { rating, comment } = req.body;
    
    if (!hotelId || !rating || !comment) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({ error: 'Invalid hotel ID format' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const review = await Review.create({
      hotelId,
      userId: req.user.id,
      rating,
      comment
    });
    
    const populatedReview = await Review.findById(review._id).populate('userId', 'name');
    
    res.status(201).json({
      id: populatedReview._id,
      hotel_id: populatedReview.hotelId,
      user_id: populatedReview.userId?._id,
      user_name: populatedReview.userId?.name || 'Anonymous',
      rating: populatedReview.rating,
      comment: populatedReview.comment,
      created_at: populatedReview.createdAt
    });
  } catch (err) {
    console.error('Review submission error:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// GET Bookings for currently logged-in user
app.get('/api/bookings', authenticateUser, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('hotelId')
      .populate('flightId')
      .sort({ createdAt: -1 });
    
    const mappedBookings = bookings.map(booking => {
      const mapped = {
        id: booking._id,
        user_id: booking.userId,
        booking_type: booking.bookingType,
        check_in: booking.checkIn,
        check_out: booking.checkOut,
        guests: booking.guests,
        rooms: booking.rooms,
        total_price: booking.totalPrice,
        created_at: booking.createdAt
      };

      if (booking.hotelId) {
        mapped.hotel_id = booking.hotelId._id;
        mapped.hotel_name = booking.hotelId.name;
        mapped.hotel_location = booking.hotelId.location;
        mapped.hotel_image = booking.hotelId.image;
      }

      if (booking.flightId) {
        mapped.flight_id = booking.flightId._id;
        mapped.flight_number = booking.flightId.flightNumber;
        mapped.departure_city = booking.flightId.departureCity;
        mapped.arrival_city = booking.flightId.arrivalCity;
        mapped.departure_time = booking.flightId.departureTime;
        mapped.airline_name = booking.flightId.airlineName;
      }

      return mapped;
    });

    res.json(mappedBookings);
  } catch (err) {
    console.error('Fetch bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Bookings API (Hotel & Flight)
app.post('/api/bookings', authenticateUser, async (req, res) => {
  try {
    const { hotelId, flightId, checkIn, checkOut, guests, rooms } = req.body;
    
    if (hotelId) {
      // Hotel Booking
      if (!checkIn || !checkOut || !guests || !rooms) {
        return res.status(400).json({ error: 'All hotel booking fields are required' });
      }

      if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        return res.status(400).json({ error: 'Invalid hotel ID format' });
      }

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({ error: 'Hotel not found' });
      }

      if (hotel.roomsAvailable < rooms) {
        return res.status(400).json({ error: `Not enough rooms available in this hotel. Only ${hotel.roomsAvailable} rooms left.` });
      }

      const totalPrice = hotel.price * rooms;
      
      // Deduct booked rooms
      hotel.roomsAvailable -= rooms;
      await hotel.save();
      
      const booking = await Booking.create({
        hotelId,
        userId: req.user.id,
        bookingType: 'hotel',
        checkIn,
        checkOut,
        guests,
        rooms,
        totalPrice
      });
      
      return res.status(201).json({
        id: booking._id,
        hotel_id: booking.hotelId,
        user_id: booking.userId,
        booking_type: booking.bookingType,
        check_in: booking.checkIn,
        check_out: booking.checkOut,
        guests: booking.guests,
        rooms: booking.rooms,
        total_price: booking.totalPrice,
        created_at: booking.createdAt,
        hotel_name: hotel.name,
        hotel_location: hotel.location
      });
    } else if (flightId) {
      // Flight Booking
      if (!guests) {
        return res.status(400).json({ error: 'Guests count is required for flight booking' });
      }

      if (!mongoose.Types.ObjectId.isValid(flightId)) {
        return res.status(400).json({ error: 'Invalid flight ID format' });
      }

      const flight = await Flight.findById(flightId);
      if (!flight) {
        return res.status(404).json({ error: 'Flight not found' });
      }

      const totalPrice = flight.price * guests;

      const booking = await Booking.create({
        flightId,
        userId: req.user.id,
        bookingType: 'flight',
        guests,
        totalPrice
      });

      return res.status(201).json({
        id: booking._id,
        flight_id: booking.flightId,
        user_id: booking.userId,
        booking_type: booking.bookingType,
        guests: booking.guests,
        total_price: booking.totalPrice,
        created_at: booking.createdAt,
        flight_number: flight.flightNumber,
        departure_city: flight.departureCity,
        arrival_city: flight.arrivalCity,
        departure_time: flight.departureTime,
        airline_name: flight.airlineName
      });
    } else {
      return res.status(400).json({ error: 'Either hotelId or flightId must be provided' });
    }
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));