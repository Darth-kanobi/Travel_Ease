import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/auth';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import Flights from './pages/Flights';
import Hotels from './pages/Hotels';
import BookingPage from './pages/BookingPage'; 
import HotelDetails from './pages/HotelDetails';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage isLogin={true} />} />
          <Route path="/signup" element={<AuthPage isLogin={false} />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route 
            path="/flights" 
            element={
              <ProtectedRoute>
                <Flights />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hotels" 
            element={
              <ProtectedRoute>
                <Hotels />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking" 
            element={
              <ProtectedRoute>
                  <BookingPage />
             </ProtectedRoute>
             } 
          />
          <Route 
              path="/hotels/:id" 
              element={
               <ProtectedRoute>
                 <HotelDetails />
               </ProtectedRoute>
              } 
           />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}