import { Link } from 'react-router-dom';
import styles from './HotelCard.module.css'; 

export default function HotelCard({ hotel }) {
  const amenities = JSON.parse(hotel.amenities);
  
  // Safely handle rating - ensure it's treated as a number
  const rating = Number(hotel.rating) || 0;
  const displayRating = rating.toFixed ? rating.toFixed(1) : '0.0';
  
  return (
    <div className={styles.hotelCard}>
      <div className={styles.hotelImageContainer}>
        <img 
          src={`/images/hotels/${hotel.image}`} 
          alt={hotel.name}
          className={styles.hotelImage}
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
        
        <div className={styles.hotelPrice}>
          <div className={styles.priceContainer}>
            <span className={styles.price}>₹{hotel.price.toLocaleString()}</span>
            <span className={styles.perNight}>/ night</span>
          </div>
          <Link 
            to="/booking" 
            state={{ hotel }}
            className={styles.bookButton}
          >
            Book Now
          </Link>
          <Link 
             to="/booking" 
               state={{ hotel }}
                className={styles.bookButton}
                 onClick={(e) => {
                      if (!user) {
                         e.preventDefault();
                          navigate('/login');
                      }
                   }}
                        >
                    Book Now
                </Link>
                <div className={styles.hotelActions}>
        <Link 
          to={`/hotels/${hotel.id}`} 
          className={styles.viewDetailsButton}
        >
          View Details & Reviews
        </Link>
        <button className={styles.bookButton}>Book Now</button>
      </div>
 </div>
      </div>
    </div>
  );
}