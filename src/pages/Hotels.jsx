import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import HotelCard from '../components/HotelCard.jsx';
import styles from './Hotels.module.css';

const cityDetails = {
  'Mumbai': {
    image: '/Images/mumbaitaj.jpg',
    tagline: 'The City of Dreams',
    highlights: 'Gateway of India, Marine Drive, Bollywood',
    description: 'Mumbai, the financial capital of India, is a high-energy metropolis known for its majestic colonial heritage, seaside promenades, and the colorful world of Bollywood.'
  },
  'Delhi': {
    image: '/Images/delhi.png',
    tagline: 'The Historic Capital',
    highlights: 'Red Fort, Qutub Minar, India Gate',
    description: 'Delhi, the heart of India, blends thousands of years of history with modern politics. Explore ancient monuments, rich Mughal history, and bustling local markets.'
  },
  'Bangalore': {
    image: '/Images/bangalore.png',
    tagline: 'The Silicon Valley of India',
    highlights: 'Lalbagh, Cubbon Park, Tech Parks',
    description: 'Bangalore (Bengaluru) is India\'s tech capital. Celebrated for its sprawling parks, pleasant weather throughout the year, and a energetic, modern lifestyle.'
  },
  'Hyderabad': {
    image: '/Images/hyderabad.png',
    tagline: 'The City of Pearls',
    highlights: 'Charminar, Golconda Fort, Biryani',
    description: 'Hyderabad merges its glorious royal past with a thriving technology future. Famous for its Nizami heritage, majestic minarets, and the legendary Biryani.'
  },
  'Kochi': {
    image: '/Images/kochi.png',
    tagline: 'Queen of the Arabian Sea',
    highlights: 'Backwaters, Fort Kochi, Kathakali',
    description: 'Kochi (Cochin) is Kerala\'s primary port city. Featuring giant Chinese fishing nets, historic colonial bungalows, and tranquil backwaters.'
  }
};

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
  const parseAmenities = (amenities) => {
    if (Array.isArray(amenities)) return amenities;
    if (!amenities) return [];
    try {
      // Try parsing as JSON if stored as JSON string
      return JSON.parse(amenities);
    } catch {
      // Fallback to comma-separated string
      if (typeof amenities === 'string') {
        return amenities.split(',').map(item => item.trim()).filter(item => item);
      }
      return [];
    }
  };

  const currentCity = searchQuery?.to || '';
  const cityInfo = cityDetails[currentCity] || {
    image: '/Images/bg.jpg',
    tagline: 'Discover Beautiful Destinations',
    highlights: 'Luxury Stays, Flights, Custom Packages',
    description: `Explore premium hotel stays and flight booking deals in ${currentCity || 'your favorite cities'} across India.`
  };

  return (
    <div className={styles.hotelsPage}>
      {/* City Profile Banner */}
      <div 
        className={styles.cityProfileBanner}
        style={{ backgroundImage: `url(${cityInfo.image})` }}
      >
        <div className={styles.bannerOverlay}></div>
        <div className={styles.bannerContent}>
          <span className={styles.tagline}>{cityInfo.tagline}</span>
          <h1 className={styles.cityTitle}>{currentCity}</h1>
          <p className={styles.cityDescription}>{cityInfo.description}</p>
          <div className={styles.highlightsContainer}>
            <span className={styles.highlightsLabel}>Highlights:</span>
            <span className={styles.highlightsText}>{cityInfo.highlights}</span>
          </div>
        </div>
      </div>

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
            🔍 Search
          </button>
        </form>
      </div>
      
      <div className={styles.resultsHeader}>
        <h2 className={styles.pageTitle}>Hotels in {currentCity}</h2>
        <span className={styles.hotelCount}>{hotels.length} {hotels.length === 1 ? 'Hotel' : 'Hotels'} found</span>
      </div>
      
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