import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import styles from './BookingPage.module.css';

export default function BookingPage() {
  const { state } = useLocation();
  const { hotel } = state || {};
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
  
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = (e) => {
    e.preventDefault();
    // Simulate payment processing
    setTimeout(() => {
      setPaymentSuccess(true);
      // In a real app, you would save the booking to your database here
    }, 2000);
  };

  if (!hotel) {
    navigate('/hotels');
    return null;
  }

  if (paymentSuccess) {
    return (
      <div className={styles.successContainer}>
        <h2>Booking Confirmed!</h2>
        <p>Your booking at {hotel.name} has been confirmed.</p>
        <button onClick={() => navigate('/')}>Return to Home</button>
      </div>
    );
  }

  return (
    <div className={styles.bookingContainer}>
      <div className={styles.hotelInfo}>
        <h2>Booking: {hotel.name}</h2>
        <p>Location: {hotel.location}</p>
        <p>Price: ₹{hotel.price.toLocaleString()} per night</p>
      </div>
      
      <form onSubmit={handlePayment} className={styles.bookingForm}>
        <h3>Booking Details</h3>
        
        <div className={styles.formGroup}>
          <label>Check-in Date</label>
          <input 
            type="date" 
            name="checkIn" 
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
            value={bookingDetails.checkOut}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Guests</label>
          <input 
            type="number" 
            name="guests" 
            min="1"
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
            value={bookingDetails.rooms}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <h3>Personal Information</h3>
        
        <div className={styles.formGroup}>
          <label>Full Name</label>
          <input 
            type="text" 
            name="name" 
            value={bookingDetails.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            value={bookingDetails.email}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Phone</label>
          <input 
            type="tel" 
            name="phone" 
            value={bookingDetails.phone}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <h3>Payment Information</h3>
        
        <div className={styles.paymentCard}>
          <div className={styles.cardIcons}>
            <span>💳</span>
            <span>🔒</span>
          </div>
          <div className={styles.formGroup}>
            <label>Card Number</label>
            <input 
              type="text" 
              placeholder="1234 5678 9012 3456"
              pattern="[0-9\s]{16,19}"
              required
            />
          </div>
          
          <div className={styles.cardDetails}>
            <div className={styles.formGroup}>
              <label>Expiry Date</label>
              <input 
                type="text" 
                placeholder="MM/YY"
                pattern="\d{2}/\d{2}"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>CVV</label>
              <input 
                type="text" 
                placeholder="123"
                pattern="\d{3}"
                required
              />
            </div>
          </div>
        </div>
        
        <button type="submit" className={styles.payButton}>
          Pay ₹{(hotel.price * bookingDetails.rooms).toLocaleString()}
        </button>
      </form>
    </div>
  );
}