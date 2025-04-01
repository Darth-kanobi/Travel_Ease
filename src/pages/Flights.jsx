import { useEffect, useState } from 'react';
import FlightCard from '../components/FlightCard';
import { useLocation, useNavigate } from 'react-router-dom';

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

        // Format the date to match your database format
        const formattedDate = new Date(searchQuery.depart).toISOString().split('T')[0];
        
        const response = await fetch(`/api/flights?departure_city=${encodeURIComponent(searchQuery.from)}&arrival_city=${encodeURIComponent(searchQuery.to)}&date=${formattedDate}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check if response has content
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
          duration: calculateDuration(flight.departure_time, flight.arrival_time)
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

  return (
    <div className="flights-page">
      <h2>Available Flights from {searchQuery?.from} to {searchQuery?.to}</h2>
      <p className="search-date">Departure: {searchQuery?.depart}</p>
      
      {loading ? (
        <div className="loading">Loading flights...</div>
      ) : error ? (
        <div className="error">
          <p>Error loading flights: {error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : flights.length === 0 ? (
        <div className="no-flights">
          No flights found for your search criteria. Try different dates or routes.
        </div>
      ) : (
        <div className="flights-list">
          {flights.map(flight => (
            <FlightCard 
              key={flight.id} 
              flight={{
                id: flight.id,
                airline: flight.airline_name,
                flightNumber: flight.flight_number,
                departure: {
                  airport: flight.departure_airport,
                  time: new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  date: new Date(flight.departure_time).toLocaleDateString(),
                  terminal: flight.departure_terminal || 'T1'
                },
                arrival: {
                  airport: flight.arrival_airport,
                  time: new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  date: new Date(flight.arrival_time).toLocaleDateString(),
                  terminal: flight.arrival_terminal || 'T1'
                },
                price: flight.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
                duration: flight.duration || calculateDuration(flight.departure_time, flight.arrival_time)
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
}