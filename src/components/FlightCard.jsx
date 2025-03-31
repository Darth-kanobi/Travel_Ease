export default function FlightCard({ flight }) {
  const formatTime = (dateTime) => new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDuration = (mins) => `${Math.floor(mins/60)}h ${mins%60}m`;

  return (
    <div className="flight-card">
      <div className="flight-header">
        <img src={`/airlines/${flight.airline.toLowerCase()}.png`} alt={flight.airline}/>
        <span className="price">₹{flight.price.toLocaleString()}</span>
      </div>
      <div className="flight-times">
        <div>
          <span className="time">{formatTime(flight.departure_time)}</span>
          <span className="code">{flight.from_code}</span>
        </div>
        <div className="duration">
          <span>{formatDuration(flight.duration)}</span>
          <div className="flight-line"></div>
        </div>
        <div>
          <span className="time">{formatTime(flight.arrival_time)}</span>
          <span className="code">{flight.to_code}</span>
        </div>
      </div>
      <button className="book-btn">Book Now</button>
    </div>
  );
}