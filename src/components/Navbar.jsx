import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">✈️</span> TravelEase
        </Link>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-item">Search</Link>
          {user && (
            <Link to="/my-bookings" className="navbar-item">My Bookings</Link>
          )}
        </div>

        <div className="navbar-auth">
          {!loading && (
            user ? (
              <div className="user-profile">
                <span className="welcome-msg">
                  Welcome, <strong>{user.name}</strong>!
                </span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="login-link">Login</Link>
                <Link to="/signup" className="signup-btn">Sign Up</Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
