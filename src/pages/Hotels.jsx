import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import HotelCard from '../components/HotelCard.jsx';
import styles from './Hotels.module.css';

export default function Hotels() {
  const { state } = useLocation();
  const { searchQuery } = state || {};
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState(searchQuery?.to || '');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate('/hotels', { state: { searchQuery: { to: searchInput } } });
    }
  };

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!searchQuery?.to) {
          navigate('/');
          return;
        }

        const apiUrl = `${import.meta.env.VITE_HOTEL_API_BASE || 'http://localhost:3001/api'}/hotels`;
        const url = new URL(apiUrl);
        url.searchParams.append('city', searchQuery.to);

        const headers = {
          'Content-Type': 'application/json'
        };

        if (user?.token) {
          headers['Authorization'] = `Bearer ${user.token}`;
        }

        const response = await fetch(url.toString(), { headers });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Process amenities from text to array
        const processedHotels = data.map(hotel => ({
          ...hotel,
          amenities: parseAmenities(hotel.amenities),
          rating: hotel.rating || 0, // Ensure rating exists
          price: hotel.price || 0    // Ensure price exists
        }));

        setHotels(processedHotels);
      } catch (err) {
        console.error('Hotel fetch error:', err);
        setError(err.message || 'Failed to load hotels');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [searchQuery, user, navigate]);

  // Helper function to parse amenities text to array
  const parseAmenities = (amenitiesText) => {
    if (!amenitiesText) return [];
    try {
      // Try parsing as JSON if stored as JSON string
      return JSON.parse(amenitiesText);
    } catch {
      // Fallback to comma-separated string
      return amenitiesText.split(',').map(item => item.trim()).filter(item => item);
    }
  };

  return (
    <div className={styles.hotelsPage}>
      <div className={styles.searchContainer}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for another destination..."
            className={styles.searchInput}
            required
          />
          <button 
            type="submit" 
            className={styles.searchButton}
            disabled={!searchInput.trim()}
          >
            Search
          </button>
        </form>
      </div>
      
      <h2 className={styles.pageTitle}>Hotels in {searchQuery?.to}</h2>
      
      {loading ? (
        <div className={styles.loadingHotels}>
          <div className={styles.spinner}></div>
          Loading hotels...
        </div>
      ) : error ? (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      ) : hotels.length === 0 ? (
        <div className={styles.noHotels}>
          <p>No hotels found in {searchQuery?.to}. Try another city.</p>
          <div className={styles.suggestions}>
            <p>Popular destinations:</p>
            <div className={styles.cityButtons}>
              {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Kochi'].map(city => (
                <button
                  key={city}
                  onClick={() => {
                    setSearchInput(city);
                    navigate('/hotels', { state: { searchQuery: { to: city } } });
                  }}
                  className={styles.cityButton}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.hotelsList}>
          {hotels.map(hotel => (
            <HotelCard 
              key={hotel.id}
              hotel={{
                ...hotel,
                // Ensure all required fields are present
                image: hotel.image || 'default-hotel.jpg',
                location: hotel.location || 'Location not specified',
                description: hotel.description || 'No description available'
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
}