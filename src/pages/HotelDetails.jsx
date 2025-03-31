import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HotelReviews from '../components/HotelReviews';
import styles from './HotelDetails.module.css';

export default function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/hotels/${id}`);
        const data = await res.json();
        setHotel(data);
      } catch (err) {
        console.error('Failed to fetch hotel:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotel();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!hotel) return <div>Hotel not found</div>;

  return (
    <div className={styles.hotelDetails}>
      <div className={styles.hotelHeader}>
        <h1>{hotel.name}</h1>
        <div className={styles.hotelRating}>
          {'★'.repeat(Math.floor(hotel.rating))}
          <span>{hotel.rating.toFixed(1)}</span>
        </div>
      </div>
      
      <div className={styles.hotelInfo}>
        <p>📍 {hotel.location}</p>
        <p>Price: ₹{hotel.price.toLocaleString()} per night</p>
      </div>
      
      <div className={styles.amenities}>
        <h3>Amenities</h3>
        <div className={styles.amenitiesList}>
          {JSON.parse(hotel.amenities).map((amenity, index) => (
            <span key={index} className={styles.amenityBadge}>
              {amenity}
            </span>
          ))}
        </div>
      </div>
      
      {/* Reviews Section */}
      <HotelReviews hotelId={hotel.id} />
      
      <div className={styles.bookingSection}>
        <Link 
          to="/booking" 
          state={{ hotel }}
          className={styles.bookButton}
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}