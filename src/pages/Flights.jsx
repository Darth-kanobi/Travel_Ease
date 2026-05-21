import { useEffect, useState } from 'react';
import FlightCard from '../components/FlightCard';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Flights.module.css';

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

export default function Flights() {
  const { state } = useLocation();
  const { searchQuery } = state || {};
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!searchQuery?.from || !searchQuery?.to || !searchQuery?.depart) {
          navigate('/');
          return;
        }

        // Format the date to YYYY-MM-DD
        const formattedDate = new Date(searchQuery.depart).toISOString().split('T')[0];
        
        const response = await fetch(`/api/flights?departure_city=${encodeURIComponent(searchQuery.from)}&arrival_city=${encodeURIComponent(searchQuery.to)}&date=${formattedDate}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            setFlights([]);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        if (!text) {
          throw new Error('Empty response from server');
        }

        const data = JSON.parse(text);
        
        // Process the data to ensure consistent structure
        const processedFlights = data.map(flight => ({
          ...flight,
          departure_time: flight.departure_time || '',
          arrival_time: flight.arrival_time || '',
          price: flight.price || 0,
          duration: flight.duration || calculateDuration(flight.departure_time, flight.arrival_time)
        }));
        
        setFlights(processedFlights);
      } catch (err) {
        console.error('Flight fetch error:', err);
        setError(err.message || 'Failed to load flight data');
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [searchQuery, navigate]);

  // Helper function to calculate flight duration
  const calculateDuration = (departure, arrival) => {
    if (!departure || !arrival) return 'N/A';
    
    const depTime = new Date(departure);
    const arrTime = new Date(arrival);
    const diff = arrTime - depTime;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const handleBookFlight = (flight) => {
    navigate('/booking', { state: { flight } });
  };

  const destCity = searchQuery?.to || '';
  const sourceCity = searchQuery?.from || '';
  const cityInfo = cityDetails[destCity] || {
    image: '/Images/bg.jpg',
    tagline: 'Explore Beautiful Destinations',
    highlights: 'Luxury Stays, Flights, Custom Packages',
    description: `Fly to ${destCity || 'your favorite cities'} and explore the best accommodation and attractions in India.`
  };

  return (
    <div className={styles.flightsPage}>
      {/* City Profile Banner */}
      <div 
        className={styles.cityProfileBanner}
        style={{ backgroundImage: `url(${cityInfo.image})` }}
      >
        <div className={styles.bannerOverlay}></div>
        <div className={styles.bannerContent}>
          <div className={styles.routeBadge}>
            ✈️ {sourceCity} to {destCity}
          </div>
          <span className={styles.tagline}>{cityInfo.tagline}</span>
          <h1 className={styles.cityTitle}>{destCity}</h1>
          <p className={styles.cityDescription}>{cityInfo.description}</p>
          <div className={styles.highlightsContainer}>
            <span className={styles.highlightsLabel}>Highlights:</span>
            <span className={styles.highlightsText}>{cityInfo.highlights}</span>
          </div>
        </div>
      </div>

      <div className={styles.resultsHeader}>
        <h2 className={styles.pageTitle}>Available Flights</h2>
        <span className={styles.searchDate}>Departure: {searchQuery?.depart}</span>
      </div>
      
      {loading ? (
        <div className={styles.loadingFlights}>
          <div className={styles.spinner}></div>
          <p>Loading flights...</p>
        </div>
      ) : error ? (
        <div className={styles.errorMessage}>
          <p>Error loading flights: {error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      ) : flights.length === 0 ? (
        <div className={styles.noFlights}>
          No flights found for your search criteria. Try different dates or routes.
        </div>
      ) : (
        <div className={styles.flightsList}>
          {flights.map(flight => (
            <FlightCard 
              key={flight.id} 
              flight={flight} 
              onBook={() => handleBookFlight(flight)}
            />
          ))}
        </div>
      )}
    </div>
  );
}