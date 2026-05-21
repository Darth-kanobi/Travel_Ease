import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { getReadableId } from '../utils/bookingUtils';
import './MyBookings.css';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('/api/bookings', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to load bookings: ${response.statusText}`);
        }

        const data = await response.json();
        setBookings(data);
      } catch (err) {
        console.error('Fetch bookings error:', err);
        setError(err.message || 'Failed to fetch bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bookings-loading">
        <div className="spinner"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="my-bookings-container">
      <div className="bookings-header">
        <h1>My Bookings Dashboard</h1>
        <p>Manage your upcoming trips and booking history</p>
      </div>

      {error && (
        <div className="bookings-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      )}

      {!error && bookings.length === 0 ? (
        <div className="empty-bookings">
          <div className="empty-icon">📅</div>
          <h2>No Bookings Found</h2>
          <p>You haven't booked any flights or hotels yet. Start planning your next journey now!</p>
          <button onClick={() => navigate('/')} className="explore-btn">
            Explore Flights & Hotels
          </button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => {
            const isHotel = booking.booking_type === 'hotel';
            
            return (
              <div key={booking.id} className="booking-card">
                <div className="booking-card-header">
                  <div className="header-badge-group">
                    <span className={`booking-type-badge ${isHotel ? 'hotel' : 'flight'}`}>
                      {isHotel ? '🏨 Hotel Stay' : '✈️ Flight Ticket'}
                    </span>
                    <span className="booking-ref-badge">
                      PNR: {getReadableId(booking.id, booking.booking_type)}
                    </span>
                  </div>
                  <div className="booking-status">
                    <span className="status-dot"></span> Confirmed
                  </div>
                </div>

                <div className="booking-card-body">
                  {isHotel ? (
                    <>
                      <div className="booking-image-wrapper">
                        <img 
                          src={`/Images/${booking.hotel_image || 'mumbaitaj.jpg'}`} 
                          alt={booking.hotel_name || 'Hotel'} 
                          className="booking-image"
                          onError={(e) => {
                            e.target.src = '/Images/mumbaitaj.jpg';
                          }}
                        />
                      </div>
                      <div className="booking-info">
                        <h3>{booking.hotel_name || 'Luxury Hotel'}</h3>
                        <p className="location">📍 {booking.hotel_location || 'Location not specified'}</p>
                        
                        <div className="booking-dates-grid">
                          <div>
                            <span className="label">Check-in</span>
                            <span className="value">{formatDate(booking.check_in)}</span>
                          </div>
                          <div>
                            <span className="label">Check-out</span>
                            <span className="value">{formatDate(booking.check_out)}</span>
                          </div>
                        </div>

                        <div className="booking-meta">
                          <span>👤 {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</span>
                          <span>🛏️ {booking.rooms} {booking.rooms === 1 ? 'Room' : 'Rooms'}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flight-route-info">
                        <div className="flight-airline">
                          <span className="airline-icon">✈️</span>
                          <div>
                            <h3>{booking.airline_name || 'Indian Airlines'}</h3>
                            <span className="flight-number">{booking.flight_number || 'AI-101'}</span>
                          </div>
                        </div>

                        <div className="flight-details-row">
                          <div className="flight-station">
                            <span className="city">{booking.departure_city || 'Origin'}</span>
                            <span className="time">{formatTime(booking.departure_time)}</span>
                            <span className="date">{formatDate(booking.departure_time)}</span>
                          </div>

                          <div className="flight-arrow">
                            <span>➔</span>
                            <span className="type">Non-stop</span>
                          </div>

                          <div className="flight-station">
                            <span className="city">{booking.arrival_city || 'Destination'}</span>
                            <span className="time">
                              {booking.departure_time 
                                ? formatTime(new Date(new Date(booking.departure_time).getTime() + 150 * 60 * 1000).toISOString()) 
                                : 'N/A'}
                            </span>
                            <span className="date">{formatDate(booking.departure_time)}</span>
                          </div>
                        </div>

                        <div className="booking-meta">
                          <span>👤 {booking.guests} {booking.guests === 1 ? 'Passenger' : 'Passengers'}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="booking-card-footer">
                  <div className="booking-date">
                    Booked on: {formatDate(booking.created_at)}
                  </div>
                  <div className="booking-price">
                    Total Paid: <strong>₹{booking.total_price?.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
