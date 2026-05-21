import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/auth';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import Flights from './pages/Flights';
import Hotels from './pages/Hotels';
import BookingPage from './pages/BookingPage'; 
import HotelDetails from './pages/HotelDetails';
import MyBookings from './pages/MyBookings';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          <Navbar />
          <main style={{ flex: '1 0 auto' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<AuthPage isLogin={true} />} />
              <Route path="/signup" element={<AuthPage isLogin={false} />} />
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
              <Route 
                  path="/bookings" 
                  element={
                   <ProtectedRoute>
                     <MyBookings />
                   </ProtectedRoute>
                  } 
               />
              <Route 
                  path="/my-bookings" 
                  element={
                   <ProtectedRoute>
                     <MyBookings />
                   </ProtectedRoute>
                  } 
               />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}