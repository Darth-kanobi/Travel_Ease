import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth';

export default function AuthPage({ isLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:3001/api/${isLogin ? 'login' : 'signup'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? {
          email: formData.email,
          password: formData.password
        } : formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }
      
      localStorage.setItem('token', data.token);
      login(data.token);
      
      // Redirect to the intended page or home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        <p className="text-center text-gray-600 mb-6">
          {isLogin ? 'Welcome back!' : 'Create your account'}
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Enter your full name"
              />
            </div>
          )}
          
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength={6}
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              'Processing...'
            ) : isLogin ? (
              'Login'
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          {isLogin ? (
            <p>Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link></p>
          ) : (
            <p>Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link></p>
          )}
        </div>
      </div>
    </div>
  );
}