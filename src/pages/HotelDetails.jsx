import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HotelReviews from '../components/HotelReviews';
import styles from './HotelDetails.module.css';

export default function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/hotels/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !data.id) {
          throw new Error('Invalid hotel data structure');
        }

        // Ensure amenities is a valid JSON array
        if (typeof data.amenities === 'string') {
          try {
            data.amenities = JSON.parse(data.amenities);
          } catch (e) {
            data.amenities = [];
          }
        }

        setHotel(data);
        setError(null);
      } catch (err) {
        console.error('Hotel fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading hotel details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error Loading Hotel</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/hotels')} 
          className={styles.backButton}
        >
          Back to Hotels List
        </button>
      </div>
    );
  }

  return (
    <div className={styles.hotelDetails}>
      <div className={styles.hotelHeader}>
        <h1>{hotel.name}</h1>
        <div className={styles.ratingContainer}>
          <div className={styles.starRating}>
            {'★'.repeat(Math.floor(hotel.rating))}
            {'☆'.repeat(5 - Math.floor(hotel.rating))}
          </div>
          <span className={styles.ratingValue}>{typeof hotel.rating === 'number' ? hotel.rating.toFixed(1) : 'N/A'}</span>
        </div>
      </div>

      <div className={styles.hotelImageContainer}>
        <img 
          src={`/images/hotels/${hotel.image || 'default.jpg'}`} 
          alt={hotel.name}
          className={styles.hotelImage}
          onError={(e) => {
            e.target.src = '/images/hotels/default.jpg';
          }}
        />
      </div>

      <div className={styles.hotelInfo}>
        <p className={styles.location}>
          <span className={styles.icon}>📍</span>
          {hotel.location}
        </p>
        <p className={styles.price}>
          ₹{hotel.price.toLocaleString('en-IN')} <span className={styles.perNight}>/ night</span>
        </p>
      </div>

      {hotel.description && (
        <div className={styles.description}>
          <h3>Description</h3>
          <p>{hotel.description}</p>
        </div>
      )}

      <div className={styles.amenitiesSection}>
        <h3>Amenities</h3>
        <div className={styles.amenitiesGrid}>
          {Array.isArray(hotel.amenities) && hotel.amenities.map((amenity, index) => (
            <div key={index} className={styles.amenityItem}>
              {amenity}
            </div>
          ))}
        </div>
      </div>

      <HotelReviews hotelId={hotel.id} />

      <div className={styles.bookingSection}>
        <Link
          to="/booking"
          state={{ hotel }}
          className={styles.bookNowButton}
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}