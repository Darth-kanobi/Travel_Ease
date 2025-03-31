import { useEffect, useState } from 'react';
import FlightCard from '../components/FlightCard';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';

export default function Flights() {
  const { state } = useLocation();
  const { searchQuery } = state || {};
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        if (!searchQuery?.from || !searchQuery?.to || !searchQuery?.depart) {
          navigate('/');
          return;
        }

        const res = await fetch(
          `http://localhost:3001/api/flights?from=${searchQuery.from}&to=${searchQuery.to}&date=${searchQuery.depart}`,
          {
            headers: {
              'Authorization': `Bearer ${user?.token}`
            }
          }
        );

        if (!res.ok) {
          throw new Error('Failed to fetch flights');
        }

        const data = await res.json();
        setFlights(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [searchQuery, user, navigate]);

  return (
    <div className="flights-page">
      <h2>Available Flights from {searchQuery?.from} to {searchQuery?.to}</h2>
      {loading ? (
        <p>Loading flights...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : flights.length === 0 ? (
        <p>No flights found for your search criteria</p>
      ) : (
        <div className="flights-list">
          {flights.map(flight => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      )}
    </div>
  );
}