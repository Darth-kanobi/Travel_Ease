import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section brand-section">
          <Link to="/" className="footer-logo">
            <span className="logo-icon">✈️</span> TravelEase
          </Link>
          <p className="footer-desc">
            Your premium domestic travel booking partner. Seamless flight tickets and hotel stays across India's top business and leisure destinations.
          </p>
        </div>

        <div className="footer-section links-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home & Search</Link></li>
            {user ? (
              <li><Link to="/my-bookings">My Bookings</Link></li>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/signup">Register</Link></li>
              </>
            )}
          </ul>
        </div>

        <div className="footer-section destinations-section">
          <h3>Top Cities Served</h3>
          <ul>
            <li>Mumbai (BOM)</li>
            <li>Delhi (DEL)</li>
            <li>Bangalore (BLR)</li>
            <li>Hyderabad (HYD)</li>
            <li>Kochi (COK)</li>
          </ul>
        </div>

        <div className="footer-section contact-section">
          <h3>Contact Support</h3>
          <p>📞 1800-123-4567 (Toll-Free)</p>
          <p>✉️ support@travelease.com</p>
          <p>📍 Mumbai, Maharashtra, India</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} TravelEase Private Limited. All Rights Reserved. Built with ❤️ in India.</p>
      </div>
    </footer>
  );
}
