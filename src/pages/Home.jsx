import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

// Aviation Stack API key (should be in environment variables in production)
const API_KEY = 'YOUR_AVIATION_STACK_API_KEY';
const API_BASE = 'http://api.aviationstack.com/v1';

export default function Home() {
  const [flights, setFlights] = useState([]);
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
  const navigate = useNavigate();

  // Indian cities data
  const indianCities = [
    { id: 1, name: 'Mumbai', code: 'BOM', image: 'mumbai.jpg' },
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
          image: 'mumbai.jpg', 
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
    try {
      const response = await fetch(
        `${API_BASE}/flights?access_key=${API_KEY}&dep_iata=${fromCode}&arr_iata=${toCode}&flight_date=${date}`
      );
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        // Process flight data
        const processedFlights = data.data.map(flight => ({
          id: flight.flight.number,
          airline: flight.airline.name,
          flightNumber: flight.flight.number,
          departure: {
            airport: flight.departure.airport,
            time: flight.departure.scheduled,
            terminal: flight.departure.terminal || 'T1'
          },
          arrival: {
            airport: flight.arrival.airport,
            time: flight.arrival.scheduled,
            terminal: flight.arrival.terminal || 'T1'
          },
          price: Math.floor(Math.random() * 5000) + 3000, // Mock price since API doesn't provide
          duration: calculateFlightDuration(
            flight.departure.scheduled,
            flight.arrival.scheduled
          )
        }));
        
        setFlights(processedFlights);
      } else {
        setFlights([]);
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
      setFlights([]);
    } finally {
      setIsSearching(false);
    }
  };

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
    
    // Validate city selection
    const fromCity = indianCities.find(city => city.name === searchQuery.from);
    const toCity = indianCities.find(city => city.name === searchQuery.to);
    
    if (activeTab === 'flights') {
      if (!fromCity || !toCity) {
        alert('Please select from our served cities: Mumbai, Delhi, Bangalore, Hyderabad, Kochi');
        return;
      }
      if (!searchQuery.depart) {
        alert('Please select a departure date');
        return;
      }
      
      // Fetch flights from API
      await fetchFlights(fromCity.code, toCity.code, searchQuery.depart);
      
    } else { // hotels
      if (!toCity) {
        alert('Please select from our served cities: Mumbai, Delhi, Bangalore, Hyderabad, Kochi');
        return;
      }
      if (!searchQuery.depart || !searchQuery.return) {
        alert('Please select both check-in and check-out dates');
        return;
      }
      
      navigate(`/${activeTab}`, { state: { searchQuery } });
    }
  };



  return (
    <div className="home-container">
      {/* Hero Section with Taj Mahal background */}
      <section className="hero-section">
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
                to="/Login"
                className="px-6 py-3 bg-white text-gold-600 font-bold rounded-lg hover:bg-gray-100 transition border border-gold-300">
                    Login
             </Link>
                <Link
                    to="/signup"
                    className="px-6 py-3 bg-gold-600 text-white font-bold rounded-lg hover:bg-gold-700 transition">
                        Signup
                    </Link>
                </div>
        </div>
      </section>

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
          <button type="submit" className="search-button">
            {activeTab === 'flights' ? 'Search Flights' : 'Find Hotels'}
          </button>
        </form>
      </div>
      {activeTab === 'flights' && flights.length > 0 && (
    <section className="flight-results">
      <h2>Available Flights</h2>
      <div className="flights-grid">
        {flights.map(flight => (
          <div key={flight.id} className="flight-card">
            <div className="flight-header">
              <h3>{flight.airline}</h3>
              <span className="flight-number">{flight.flightNumber}</span>
            </div>
            <div className="flight-details">
              <div className="departure">
                <div className="time">{new Date(flight.departure.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                <div className="airport">{flight.departure.airport}</div>
                <div className="terminal">Terminal {flight.departure.terminal}</div>
              </div>
              <div className="duration">
                <div className="line"></div>
                <div className="time">{flight.duration}</div>
                <div className="line"></div>
              </div>
              <div className="arrival">
                <div className="time">{new Date(flight.arrival.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                <div className="airport">{flight.arrival.airport}</div>
                <div className="terminal">Terminal {flight.arrival.terminal}</div>
              </div>
            </div>
            <div className="flight-footer">
              <div className="price">₹{flight.price}</div>
              <button 
                className="book-button"
                onClick={() => navigate('/booking', { state: { flight, searchQuery } })}
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )}

  {/* No Flights Found Message */}
  {activeTab === 'flights' && flights.length === 0 && isSearching === false && (
    <div className="no-flights">
      <p>No flights found for your selected route and date.</p>
      <p>Please try different cities or dates.</p>
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