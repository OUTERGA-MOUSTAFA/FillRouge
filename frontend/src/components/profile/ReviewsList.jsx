import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { reviewsService } from '../../services/reviews';

export default function ReviewsList({ userId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewsService.getUserReviews(userId);
      setReviews(response.data.reviews?.data || []);
      setStats(response.data.stats || { average_rating: 0, total_reviews: 0 });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <StarIcon key={star} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarOutlineIcon key={star} className="h-4 w-4 text-gray-300" />
          )
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-4">Chargement des avis...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucun avis pour le moment</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 pb-4 border-b">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{stats.average_rating}</div>
            <div className="text-sm text-gray-500">sur 5</div>
          </div>
          <div>
            {renderStars(Math.round(stats.average_rating))}
            <div className="text-sm text-gray-500 mt-1">{stats.total_reviews} avis</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {review.reviewer?.avatar ? (
                  <img
                    src={review.reviewer.avatar}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">{review.reviewer?.full_name?.[0]}yughhjhgjhgjhgghjgg</span>
                  </div>
                )}
                <span className="font-medium text-gray-900">{review.reviewer?.full_name}</span>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(review.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
            {renderStars(review.rating)}
            {review.comment && (
              <p className="text-gray-600 mt-2">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}