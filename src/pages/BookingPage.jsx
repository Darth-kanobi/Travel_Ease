import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { getReadableId } from '../utils/bookingUtils';
import styles from './BookingPage.module.css';

export default function BookingPage() {
  const { state } = useLocation();
  const { hotel, flight } = state || {};
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [bookingDetails, setBookingDetails] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1,
    name: '',
    email: '',
    phone: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [error, setError] = useState('');

  // Populate user info from auth context
  useEffect(() => {
    if (user) {
      setBookingDetails(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // If neither hotel nor flight is provided in state, redirect to home
  useEffect(() => {
    if (!hotel && !flight) {
      navigate('/');
    }
  }, [hotel, flight, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const isHotel = !!hotel;
      
      // Client-side room availability validation
      if (isHotel && hotel.roomsAvailable !== undefined && parseInt(bookingDetails.rooms) > hotel.roomsAvailable) {
        throw new Error(`Requested number of rooms exceeds availability. Only ${hotel.roomsAvailable} rooms are available.`);
      }

      const body = isHotel 
        ? {
            hotelId: hotel.id,
            checkIn: bookingDetails.checkIn,
            checkOut: bookingDetails.checkOut,
            guests: parseInt(bookingDetails.guests),
            rooms: parseInt(bookingDetails.rooms)
          }
        : {
            flightId: flight.id,
            guests: parseInt(bookingDetails.guests)
          };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      setConfirmedBooking(data);
      setPaymentSuccess(true);
    } catch (err) {
      console.error('Booking submission error:', err);
      setError(err.message || 'An error occurred while confirming your booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hotel && !flight) {
    return null;
  }

  const isHotelBooking = !!hotel;
  const itemPrice = isHotelBooking ? hotel.price : (flight?.price || 0);
  const totalAmount = isHotelBooking 
    ? (itemPrice * (parseInt(bookingDetails.rooms) || 1)) 
    : (itemPrice * (parseInt(bookingDetails.guests) || 1));

  if (paymentSuccess) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>✓</div>
        <h2>Booking Confirmed!</h2>
        <p>
          Your {isHotelBooking ? 'hotel stay' : 'flight seat'} at{' '}
          <strong>{isHotelBooking ? hotel.name : flight?.airline_name}</strong> has been booked successfully.
        </p>
        {confirmedBooking && (
          <div className={styles.bookingRefCard}>
            <span className={styles.bookingRefLabel}>Booking Reference PNR</span>
            <span className={styles.bookingRefValue}>
              {getReadableId(confirmedBooking.id || confirmedBooking._id, isHotelBooking ? 'hotel' : 'flight')}
            </span>
          </div>
        )}
        <p className={styles.successSubtext}>
          You can view and manage this booking on your bookings dashboard.
        </p>
        <div className={styles.successActions}>
          <button onClick={() => navigate('/bookings')} className={styles.dashboardBtn}>
            Go to My Bookings
          </button>
          <button onClick={() => navigate('/')} className={styles.homeBtn}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bookingContainer}>
      {isHotelBooking ? (
        <div className={styles.hotelInfo}>
          <span className={styles.badge}>🏨 Hotel Booking</span>
          <h2>{hotel.name}</h2>
          <p className={styles.location}>📍 {hotel.location}</p>
          <p className={styles.pricePerNight}>₹{hotel.price.toLocaleString('en-IN')} per night</p>
        </div>
      ) : (
        <div className={styles.hotelInfo}>
          <span className={styles.badge}>✈️ Flight Booking</span>
          <h2>{flight.airline_name} — {flight.flight_number}</h2>
          <p className={styles.location}>
            🛫 {flight.departure_city} ({flight.departure_airport}) → 🛬 {flight.arrival_city} ({flight.arrival_airport})
          </p>
          <p className={styles.pricePerNight}>₹{flight.price.toLocaleString('en-IN')} per passenger</p>
        </div>
      )}

      {error && (
        <div className={styles.errorBanner}>
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmitBooking} className={styles.bookingForm}>
        <h3>Booking Details</h3>
        
        {isHotelBooking ? (
          <>
            <div className={styles.formGroup}>
              <label>Check-in Date</label>
              <input 
                type="date" 
                name="checkIn" 
                min={new Date().toISOString().split('T')[0]}
                value={bookingDetails.checkIn}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Check-out Date</label>
              <input 
                type="date" 
                name="checkOut" 
                min={bookingDetails.checkIn || new Date().toISOString().split('T')[0]}
                value={bookingDetails.checkOut}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Guests</label>
                <input 
                  type="number" 
                  name="guests" 
                  min="1"
                  max="10"
                  value={bookingDetails.guests}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Rooms</label>
                <input 
                  type="number" 
                  name="rooms" 
                  min="1"
                  max={hotel.roomsAvailable !== undefined ? hotel.roomsAvailable : 5}
                  value={bookingDetails.rooms}
                  onChange={handleInputChange}
                  required
                />
                <span className={styles.availabilityLabel}>
                  {hotel.roomsAvailable !== undefined ? (
                    hotel.roomsAvailable <= 5 ? (
                      <span className={styles.lowAvailability}>⚠️ Only {hotel.roomsAvailable} left!</span>
                    ) : (
                      <span className={styles.normalAvailability}>🟢 {hotel.roomsAvailable} available</span>
                    )
                  ) : 'Availability check active'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.formGroup}>
            <label>Number of Passengers</label>
            <input 
              type="number" 
              name="guests" 
              min="1"
              max="9"
              value={bookingDetails.guests}
              onChange={handleInputChange}
              required
            />
          </div>
        )}
        
        <h3>Personal Information</h3>
        
        <div className={styles.formGroup}>
          <label>Full Name</label>
          <input 
            type="text" 
            name="name" 
            placeholder="Enter your full name"
            value={bookingDetails.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              placeholder="name@example.com"
              value={bookingDetails.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              placeholder="e.g. +91 9876543210"
              value={bookingDetails.phone}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        
        <h3>Payment Information</h3>
        
        <div className={styles.paymentCard}>
          <div className={styles.cardIcons}>
            <span>💳 Credit/Debit Card</span>
            <span className={styles.secureBadge}>🔒 Secure 256-bit Connection</span>
          </div>
          
          <div className={styles.formGroup}>
            <label>Card Number</label>
            <input 
              type="text" 
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              required
            />
          </div>
          
          <div className={styles.cardDetails}>
            <div className={styles.formGroup}>
              <label>Expiry Date</label>
              <input 
                type="text" 
                placeholder="MM/YY"
                maxLength="5"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>CVV</label>
              <input 
                type="password" 
                placeholder="•••"
                maxLength="3"
                required
              />
            </div>
          </div>
        </div>
        
        <button type="submit" className={styles.payButton} disabled={isSubmitting}>
          {isSubmitting ? 'Processing Payment...' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
        </button>
      </form>
    </div>
  );
}