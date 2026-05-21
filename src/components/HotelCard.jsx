// src/components/HotelCard.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import styles from './HotelCard.module.css';

export default function HotelCard({ hotel }) {
  const amenities = Array.isArray(hotel.amenities)
    ? hotel.amenities
    : (typeof hotel.amenities === 'string'
        ? (hotel.amenities.trim().startsWith('[') ? JSON.parse(hotel.amenities) : hotel.amenities.split(',').map(s => s.trim()))
        : []);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const rating = Number(hotel.rating) || 0;
  const displayRating = rating.toFixed ? rating.toFixed(1) : '0.0';
  
  const handleBookNow = (e) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <div className={styles.hotelCard}>
      <div className={styles.hotelImageContainer}>
        <img 
          src={`/Images/${hotel.image || 'mumbaitaj.jpg'}`} 
          alt={hotel.name}
          className={styles.hotelImage}
          onError={(e) => {
            e.target.src = '/Images/mumbaitaj.jpg';
          }}
        />
        <div className={styles.hotelRating}>
          {'★'.repeat(Math.floor(rating))}
          {'☆'.repeat(5 - Math.floor(rating))}
          <span>{displayRating}</span>
        </div>
      </div>
      
      <div className={styles.hotelDetails}>
        <h3>{hotel.name}</h3>
        <p className={styles.hotelLocation}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#FF9933" viewBox="0 0 16 16">
            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
          </svg>
          {hotel.location}
        </p>
        
        <div className={styles.hotelAmenities}>
          {amenities.slice(0, 4).map((amenity, index) => (
            <span key={index} className={styles.amenityBadge}>
              {amenity}
            </span>
          ))}
          {amenities.length > 4 && (
            <span className={styles.amenityMore}>+{amenities.length - 4}</span>
          )}
        </div>

        <div className={styles.roomAvailability}>
          {hotel.roomsAvailable !== undefined ? (
            hotel.roomsAvailable <= 5 ? (
              <span className={styles.lowRooms}>⚠️ Only {hotel.roomsAvailable} rooms left!</span>
            ) : (
              <span className={styles.normalRooms}>🏨 {hotel.roomsAvailable} rooms available</span>
            )
          ) : null}
        </div>
        
        <div className={styles.hotelActions}>
          <Link 
            to={`/hotels/${hotel.id}`} 
            className={styles.viewDetailsButton}
          >
            View Details & Reviews
          </Link>
          
          <Link 
            to="/booking" 
            state={{ hotel }}
            className={styles.bookButton}
            onClick={handleBookNow}
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}