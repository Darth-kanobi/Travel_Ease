import React from 'react';
import './FlightCard.css';

export default function FlightCard({ flight, onBook }) {
  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleDateString([], { day: '2-digit', month: 'short' });
  };

  return (
    <div className="flight-card-container">
      <div className="flight-header">
        <div className="airline-info">
          <span className="airline-icon">✈️</span>
          <div className="airline-details">
            <span className="airline-name">{flight.airline_name}</span>
            <span className="flight-number">{flight.flight_number}</span>
          </div>
        </div>
        <div className="price-info">
          <span className="price-label">Price starting from</span>
          <span className="price">₹{flight.price?.toLocaleString('en-IN')}</span>
        </div>
      </div>
      
      <div className="flight-body">
        <div className="time-block departure">
          <span className="time">{formatTime(flight.departure_time)}</span>
          <span className="city">{flight.departure_city}</span>
          <span className="airport">{flight.departure_airport}</span>
          <span className="terminal">Terminal {flight.departure_terminal || 'T1'}</span>
          <span className="date">{formatDate(flight.departure_time)}</span>
        </div>
        
        <div className="duration-block">
          <span className="duration">{flight.duration}</span>
          <div className="flight-progress">
            <div className="progress-dot start"></div>
            <div className="progress-line"></div>
            <div className="progress-icon">✈️</div>
            <div className="progress-dot end"></div>
          </div>
          <span className="stops">Non-stop</span>
        </div>
        
        <div className="time-block arrival">
          <span className="time">{formatTime(flight.arrival_time)}</span>
          <span className="city">{flight.arrival_city}</span>
          <span className="airport">{flight.arrival_airport}</span>
          <span className="terminal">Terminal {flight.arrival_terminal || 'T1'}</span>
          <span className="date">{formatDate(flight.arrival_time)}</span>
        </div>
      </div>
      
      <div className="flight-footer">
        <span className="seats-badge">{flight.seats_available} seats left</span>
        {onBook && (
          <button className="book-btn" onClick={onBook}>
            Book Now
          </button>
        )}
      </div>
    </div>
  );
}