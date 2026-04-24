import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { reviewsService } from '../../services/reviews';

const Stars = ({ rating, size = 'sm' }) => {
  const cls = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s =>
        s <= rating
          ? <StarIcon key={s} className={`${cls} text-[#00BBA7]`} />
          : <StarOutlineIcon key={s} className={`${cls} text-[#ccefeb]`} />
      )}
    </div>
  );
};

export default function ReviewsList({ userId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats]     = useState({ average_rating: 0, total_reviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReviews(); }, [userId]);

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

  if (loading) return (
    <div className="flex items-center justify-center py-8 gap-2">
      <div className="w-5 h-5 rounded-full border-2 border-[#00BBA7] border-t-transparent animate-spin" />
      <span className="text-sm text-gray-400">Chargement des avis…</span>
    </div>
  );

  if (reviews.length === 0) return (
    <div className="text-center py-10">
      <div className="w-12 h-12 rounded-full bg-[#e6f7f5] flex items-center justify-center mx-auto mb-3">
        <StarOutlineIcon className="w-6 h-6 text-[#00BBA7]" />
      </div>
      <p className="text-sm text-gray-500 font-medium">Aucun avis pour le moment</p>
    </div>
  );

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center gap-5 p-4 rounded-2xl bg-[#e6f7f5] mb-6">
        <div className="text-center">
          <div className="text-3xl font-black text-[#00BBA7] leading-none">
            {Number(stats.average_rating).toFixed(1)}
          </div>
          <div className="text-[10px] text-[#009966] font-semibold uppercase tracking-wide mt-0.5">sur 5</div>
        </div>
        <div className="h-10 w-px bg-[#99dfd7]" />
        <div>
          <Stars rating={Math.round(stats.average_rating)} size="lg" />
          <p className="text-xs text-[#00734d] mt-1 font-medium">{stats.total_reviews} avis vérifiés</p>
        </div>
      </div>

      {/* Review list */}
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="group p-4 rounded-2xl border border-gray-100 hover:border-[#ccefeb] hover:bg-[#e6f7f5]/30 transition-all duration-200">
            <div className="flex items-start justify-between gap-3">
              {/* Reviewer */}
              <div className="flex items-center gap-2.5">
                {review.reviewer?.avatar ? (
                  <img
                    src={review.reviewer.avatar}
                    alt=""
                    className="h-9 w-9 rounded-xl object-cover ring-2 ring-[#ccefeb]"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-xl bg-[#ccefeb] flex items-center justify-center ring-2 ring-[#99dfd7]">
                    <span className="text-sm font-bold text-[#00734d]">
                      {review.reviewer?.full_name?.[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{review.reviewer?.full_name}</p>
                  <Stars rating={review.rating} />
                </div>
              </div>

              {/* Date */}
              <span className="text-[11px] text-gray-400 flex-shrink-0 mt-0.5">
                {new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {review.comment && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed pl-[46px]">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}