import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import styles from './HotelReview.module.css';

export default function HotelReviews({ hotelId }) {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/reviews?hotelId=${hotelId}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch reviews');
        }

        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error:', err);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [hotelId]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit a review');
      navigate('/login');
      return;
    }
  
    try {
      const res = await fetch('http://localhost:3001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          hotel_id: hotelId,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });
  
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }
  
      // Refresh reviews after successful submission
      fetchReviews();
      setNewReview({ rating: 5, comment: '' });
      
    } catch (err) {
      alert(err.message);
      console.error('Submission error:', err);
    }
  };

  if (loading) return <div>Loading reviews...</div>;

  return (
    <div className={styles.reviewsContainer}>
      <h3>Guest Reviews</h3>
      
      {user && (
        <form onSubmit={handleSubmit} className={styles.reviewForm}>
          <h4>Write a Review</h4>
          <div className={styles.ratingInput}>
            <label>Rating:</label>
            <select 
              value={newReview.rating}
              onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}
            >
              {[5, 4, 3, 2, 1].map(num => (
                <option key={num} value={num}>{num} ★</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Share your experience..."
            value={newReview.comment}
            onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
            required
          />
          <button type="submit">Submit Review</button>
        </form>
      )}
      
      <div className={styles.reviewsList}>
        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <span className={styles.reviewRating}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </span>
                <span className={styles.reviewUser}>
                  {review.user?.name || 'Anonymous'}
                </span>
                <span className={styles.reviewDate}>
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className={styles.reviewComment}>{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}