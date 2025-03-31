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
    navigate('/hotels', { state: { searchQuery: { to: searchInput } } });
  };

 // Update the fetchHotels useEffect in Hotels.jsx
useEffect(() => {
  const fetchHotels = async () => {
    try {
      if (!searchQuery?.to) {
        // Only navigate if there's no initial search query
        if (!state?.fromBooking) {
          navigate('/');
        }
        return;
      }

      const res = await fetch(
        `http://localhost:3001/api/hotels?city=${searchQuery.to}`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error('Failed to fetch hotels');
      }

      const data = await res.json();
      setHotels(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchHotels();
}, [searchQuery, user, navigate, state]);

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
          />
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </form>
      </div>
      
      <h2 className={styles.pageTitle}>Hotels in {searchQuery?.to}</h2>
      
      {loading ? (
        <div className={styles.loadingHotels}>Loading hotels...</div>
      ) : error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : (
        <div className={styles.hotelsList}>
          {hotels.length === 0 ? (
            <div className={styles.noHotels}>
              No hotels found in {searchQuery?.to}. Try another city.
            </div>
          ) : (
            hotels.map(hotel => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))
          )}
        </div>
      )}
    </div>
  );
}