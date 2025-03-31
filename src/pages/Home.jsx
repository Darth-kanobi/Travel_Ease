import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
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

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Validate city selection
    const fromCityValid = indianCities.some(city => city.name === searchQuery.from);
    const toCityValid = indianCities.some(city => city.name === searchQuery.to);
    
    if (activeTab === 'flights') {
      if (!fromCityValid || !toCityValid) {
        alert('Please select from our served cities: Mumbai, Delhi, Bangalore, Hyderabad, Kochi');
        return;
      }
      if (!searchQuery.depart) {
        alert('Please select a departure date');
        return;
      }
    } else { // hotels
      if (!toCityValid) {
        alert('Please select from our served cities: Mumbai, Delhi, Bangalore, Hyderabad, Kochi');
        return;
      }
      if (!searchQuery.depart || !searchQuery.return) {
        alert('Please select both check-in and check-out dates');
        return;
      }
    }
    
    navigate(`/${activeTab}`, { state: { searchQuery } });
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