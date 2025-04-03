import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

// API configuration - should be in environment variables
const AVIATION_API_KEY = import.meta.env.VITE_AVIATION_STACK_API_KEY || 'efee488367a87ffac6460d835f0f30fe';
const AVIATION_API_BASE = 'https://api.aviationstack.com/v1';
const HOTEL_API_BASE = import.meta.env.VITE_HOTEL_API_BASE || 'http://localhost:3001/api';

export default function Home() {
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('flights');
  const [searchQuery, setSearchQuery] = useState({
    from: '',
    to: '',
    depart: '',
    return: '',
    guests: 1
  });
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Indian cities data
  const indianCities = [
    { id: 1, name: 'Mumbai', code: 'BOM', image: '../Images/mumbaitaj.jpg'},
    { id: 2, name: 'Delhi', code: 'DEL', image: 'delhi.jpg' },
    { id: 3, name: 'Bangalore', code: 'BLR', image: 'bangalore.jpg' },
    { id: 4, name: 'Hyderabad', code: 'HYD', image: 'hyderabad.jpg' },
    { id: 5, name: 'Kochi', code: 'COK', image: 'kochi.jpg' }
  ];

  // Mock data fetch for popular destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setDestinations([
        { 
          id: 1, 
          city: 'Mumbai', 
          highlights: 'Gateway of India, Marine Drive, Bollywood', 
          image: '../Images/mumbaitaj.jpg', 
          price: '₹4,999', 
          duration: '2h 30m avg flight' 
        },
        { 
          id: 2, 
          city: 'Delhi', 
          highlights: 'Red Fort, Qutub Minar, India Gate', 
          image: 'delhi.jpg', 
          price: '₹3,999', 
          duration: '2h 15m avg flight' 
        },
        { 
          id: 3, 
          city: 'Bangalore', 
          highlights: 'Lalbagh, Cubbon Park, Tech Parks', 
          image: 'bangalore.jpg', 
          price: '₹5,499', 
          duration: '1h 45m avg flight' 
        },
        { 
          id: 4, 
          city: 'Hyderabad', 
          highlights: 'Charminar, Golconda Fort, Biryani', 
          image: 'hyderabad.jpg', 
          price: '₹4,299', 
          duration: '1h 30m avg flight' 
        },
        { 
          id: 5, 
          city: 'Kochi', 
          highlights: 'Backwaters, Fort Kochi, Kathakali', 
          image: 'kochi.jpg', 
          price: '₹6,999', 
          duration: '3h avg flight' 
        }
      ]);
      setIsLoading(false);
    };
    fetchDestinations();
  }, []);

  const fetchFlights = async (fromCode, toCode, date) => {
    setIsSearching(true);
    setError(null);
    try {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const url = new URL(`${AVIATION_API_BASE}/flights`);
      url.searchParams.append('access_key', AVIATION_API_KEY);
      url.searchParams.append('dep_iata', fromCode);
      url.searchParams.append('arr_iata', toCode);
      url.searchParams.append('flight_date', formattedDate);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch flights');
      }
      
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const processedFlights = data.data.map(flight => ({
          id: flight.flight?.number || `${fromCode}-${toCode}-${Date.now()}`,
          airline: flight.airline?.name || "Unknown Airline",
          flightNumber: flight.flight?.number || "N/A",
          departure: {
            airport: flight.departure?.airport || "Unknown Airport",
            time: flight.departure?.scheduled || new Date().toISOString(),
            terminal: flight.departure?.terminal || 'T1',
            displayDate: new Date(flight.departure?.scheduled)
              .toLocaleDateString('en-GB')
              .replace(/\//g, ' / ')
          },
          arrival: {
            airport: flight.arrival?.airport || "Unknown Airport",
            time: flight.arrival?.scheduled || new Date().toISOString(),
            terminal: flight.arrival?.terminal || 'T1'
          },
          price: Math.floor(Math.random() * 5000) + 3000, // Mock price
          duration: calculateFlightDuration(
            flight.departure?.scheduled,
            flight.arrival?.scheduled
          )
        }));
        
        setFlights(processedFlights);
      } else {
        setFlights([]);
        setError('No flights found for this route and date');
      }
    } catch (error) {
      console.error('Flight search error:', error);
      setError(error.message);
      setFlights([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch hotels from your backend
  const fetchHotels = async (city, checkIn, checkOut, guests) => {
    setIsSearching(true);
    setError(null);
    try {
      const response = await fetch(`${HOTEL_API_BASE}/hotels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city,
          checkIn,
          checkOut,
          guests: parseInt(guests)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch hotels');
      }
      
      const data = await response.json();
      setHotels(data);
    } catch (error) {
      console.error('Hotel search error:', error);
      setError(error.message);
      setHotels([]);
    } finally {
      setIsSearching(false);
    }
  };

  // NEW: Calculate flight duration
  const calculateFlightDuration = (departureTime, arrivalTime) => {
    const dep = new Date(departureTime);
    const arr = new Date(arrivalTime);
    const diff = arr - dep;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    
    const fromCity = indianCities.find(city => city.name === searchQuery.from);
    const toCity = indianCities.find(city => city.name === searchQuery.to);
    
    if (activeTab === 'flights') {
      if (!fromCity || !toCity) {
        setError('Please select from our served cities: Mumbai, Delhi, Bangalore, Hyderabad, Kochi');
        return;
      }
      if (!searchQuery.depart) {
        setError('Please select a departure date');
        return;
      }
      // Navigate to flights page with search query
      navigate('/flights', { 
        state: { 
          searchQuery: {
            from: fromCity.name,
            to: toCity.name,
            depart: searchQuery.depart,
            return: searchQuery.return
          },
          skipAuthCheck: true
        }
      });
    } else { 
      if (!toCity) {
        setError('Please select from our served cities: Mumbai, Delhi, Bangalore, Hyderabad, Kochi');
        return;
      }
      if (!searchQuery.depart || !searchQuery.return) {
        setError('Please select both check-in and check-out dates');
        return;
      }
      // Navigate to hotels page with search query
      navigate('/hotels', { 
        state: { 
          searchQuery: {
            to: toCity.name,
            depart: searchQuery.depart,
            return: searchQuery.return,
            guests: searchQuery.guests
          }
        }
      });
    }
  };

  return (
    <div className="home-container">
        {/* Hero Section */}
        <section 
            className="hero-section"
            style={{
                backgroundImage: 'url("../Images/mumbaitaj.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '500px',
                position: 'relative'
            }}
        >
            <div className="hero-content">
                <h1>Explore Incredible India</h1>
                <p>Book domestic flights and hotels across India's top 5 cities</p>
                <div className="city-badges">
                    {indianCities.map(city => (
                        <span key={city.id} className="city-badge">
                            {city.name} ({city.code})
                        </span>
                    ))}
                </div>
                <div className="auth-buttons flex gap-4 justify-center mt-8">
                    <Link
                        to="/login"
                        className="px-6 py-3 bg-white text-gold-600 font-bold rounded-lg hover:bg-gray-100 transition border border-gold-300"
                    >
                        Login
                    </Link>
                    <Link
                        to="/signup"
                        className="px-6 py-3 bg-gold-600 text-white font-bold rounded-lg hover:bg-gold-700 transition"
                    >
                        Signup
                    </Link>
                </div>
            </div>
        </section>
    </div>
);


      {/* Search Box */}
      <div className="search-box">
        <div className="search-tabs">
          <button 
            className={`tab ${activeTab === 'flights' ? 'active' : ''}`}
            onClick={() => setActiveTab('flights')}
          >
            ✈️ Flights
          </button>
          <button 
            className={`tab ${activeTab === 'hotels' ? 'active' : ''}`}
            onClick={() => setActiveTab('hotels')}
          >
            🏨 Hotels
          </button>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          {activeTab === 'flights' ? (
            <>
              <div className="form-group">
                <label>From</label>
                <select 
                  value={searchQuery.from}
                  onChange={(e) => setSearchQuery({...searchQuery, from: e.target.value})}
                  required
                >
                  <option value="">Select City</option>
                  {indianCities.map(city => (
                    <option key={city.id} value={city.name}>
                      {city.name} ({city.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>To</label>
                <select 
                  value={searchQuery.to}
                  onChange={(e) => setSearchQuery({...searchQuery, to: e.target.value})}
                  required
                >
                  <option value="">Select City</option>
                  {indianCities
                    .filter(city => city.name !== searchQuery.from)
                    .map(city => (
                      <option key={city.id} value={city.name}>
                        {city.name} ({city.code})
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label>Departure</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={searchQuery.depart}
                  onChange={(e) => setSearchQuery({...searchQuery, depart: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Return (Optional)</label>
                <input 
                  type="date" 
                  min={searchQuery.depart || new Date().toISOString().split('T')[0]}
                  value={searchQuery.return}
                  onChange={(e) => setSearchQuery({...searchQuery, return: e.target.value})}
                  disabled={!searchQuery.depart}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>City</label>
                <select 
                  value={searchQuery.to}
                  onChange={(e) => setSearchQuery({...searchQuery, to: e.target.value})}
                  required
                >
                  <option value="">Select City</option>
                  {indianCities.map(city => (
                    <option key={city.id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Check-in</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={searchQuery.depart}
                  onChange={(e) => setSearchQuery({...searchQuery, depart: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Check-out</label>
                <input 
                  type="date" 
                  min={searchQuery.depart || new Date().toISOString().split('T')[0]}
                  value={searchQuery.return}
                  onChange={(e) => setSearchQuery({...searchQuery, return: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Guests</label>
                <select
                  value={searchQuery.guests}
                  onChange={(e) => setSearchQuery({...searchQuery, guests: e.target.value})}
                  required
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <button type="submit" className="search-button" disabled={isSearching}>
            {isSearching ? 'Searching...' : (activeTab === 'flights' ? 'Search Flights' : 'Find Hotels')}
          </button>
        </form>
      </div>

      {/* NEW: Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* NEW: Loading Indicator */}
      {isSearching && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      {/* Popular Destinations */}
      <section className="destinations-section">
        <h2>Explore Our Cities</h2>
        <p>Discover the unique charm of each destination</p>
        
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : (
          <div className="destinations-grid">
            {destinations.map(destination => (
              <div key={destination.id} className="destination-card">
                <div 
                  className="destination-image"
                  style={{ backgroundImage: `url(/images/${destination.image})` }}
                >
                  <div className="price-badge">{destination.price}</div>
                  <div className="duration-badge">{destination.duration}</div>
                </div>
                <div className="destination-info">
                  <h3>{destination.city}</h3>
                  <p className="highlights">{destination.highlights}</p>
                  <button 
                    className="explore-button"
                    onClick={() => {
                      setSearchQuery({...searchQuery, to: destination.city});
                      setActiveTab('hotels');
                    }}
                  >
                    Explore Hotels
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Book With Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🛫</div>
            <h3>Instant Confirmation</h3>
            <p>Get immediate booking confirmation for all domestic flights</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Best Prices</h3>
            <p>Guaranteed lowest prices on all domestic routes</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Payments</h3>
            <p>All transactions protected with 256-bit encryption</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Easy Cancellation</h3>
            <p>Cancel or modify bookings with just few clicks</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <h2>What Our Customers Say</h2>
        <div className="testimonials-slider">
          <div className="testimonial-card">
            <div className="rating">★★★★★</div>
            <div className="testimonial-content">
              "Got the best deal for my Mumbai-Delhi flight. The process was incredibly smooth!"
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👨</div>
              <div className="author-info">
                <strong>Rahul Sharma</strong>
                <span>Frequent Traveler</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="rating">★★★★☆</div>
            <div className="testimonial-content">
              "Found a perfect hotel in Bangalore for my business trip. Great customer support!"
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👩</div>
              <div className="author-info">
                <strong>Priya Patel</strong>
                <span>Business Traveler</span>
              </div>
            </div>
          </div>
        </div>
      </section>
return (
  <div className="home-container">
      {/* Domestic Travel Tips */}
      <section className="tips-section">
          <h2>Domestic Travel Tips</h2>
          <div className="tips-grid">
              <div className="tip-card">
                  <h3>🛄 Luggage Allowance</h3>
                  <p>Most domestic flights allow 15kg check-in + 7kg cabin baggage</p>
              </div>
              <div className="tip-card">
                  <h3>⏰ Check-in Times</h3>
                  <p>Arrive at least 2 hours before departure for domestic flights</p>
              </div>
              <div className="tip-card">
                  <h3>🆔 ID Requirements</h3>
                  <p>Carry valid government photo ID (Aadhar, Passport, or Driving License)</p>
              </div>
          </div>
      </section>
  </div>
);
}


