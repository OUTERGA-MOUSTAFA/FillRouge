import { Link } from 'react-router-dom';
import { UserIcon, HeartIcon } from '@heroicons/react/24/outline';

export default function RecommendationCard({ recommendation, onLike }) {
  const { user, score, common_interests } = recommendation;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        {user.avatar ? (
          <img src={user.avatar} alt={user.full_name} className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center">
            <UserIcon className="h-7 w-7 text-gray-400" />
          </div>
        )}
        
        {/* Info */}
        <div className="flex-1">
          <Link to={`/users/${user.id}`} className="font-semibold text-gray-900 hover:text-primary-600">
            {user.full_name}
          </Link>
          <div className="text-sm text-gray-500">{user.age} ans</div>
          <div className={`text-sm font-semibold ${getScoreColor(score)}`}>
            {score}% de compatibilité
          </div>
        </div>
        
        {/* Like button */}
        <button
          onClick={() => onLike?.(user.id)}
          className="p-2 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors"
        >
          <HeartIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Common interests */}
      {common_interests && common_interests.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs text-gray-500 mb-1">Intérêts communs</div>
          <div className="flex flex-wrap gap-1">
            {common_interests.slice(0, 4).map((interest) => (
              <span key={interest} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}