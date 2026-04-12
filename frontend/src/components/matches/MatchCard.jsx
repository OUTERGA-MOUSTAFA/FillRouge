import { Link } from 'react-router-dom';
import { UserIcon, ChatBubbleLeftRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function MatchCard({ match, onAccept, onDecline, onMessage }) {
  const { user, compatibility_score, common_interests, status } = match;

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
          <img src={user.avatar} alt={user.full_name} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
        
        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Link to={`/users/${user.id}`} className="font-semibold text-gray-900 hover:text-primary-600">
              {user.full_name}
            </Link>
            <div className={`text-lg font-bold ${getScoreColor(compatibility_score)}`}>
              {compatibility_score}%
            </div>
          </div>
          <div className="text-sm text-gray-500">{user.age} ans</div>
          
          {/* Common interests */}
          {common_interests && common_interests.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {common_interests.slice(0, 3).map((interest) => (
                <span key={interest} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">
                  {interest}
                </span>
              ))}
              {common_interests.length > 3 && (
                <span className="text-xs text-gray-400">+{common_interests.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t flex gap-2">
        {status === 'pending' ? (
          <>
            <button
              onClick={() => onAccept?.(user.id)}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <CheckIcon className="h-4 w-4" />
              Accepter
            </button>
            <button
              onClick={() => onDecline?.(user.id)}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <XMarkIcon className="h-4 w-4" />
              Refuser
            </button>
          </>
        ) : (
          <button
            onClick={() => onMessage?.(user.id)}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            Envoyer un message
          </button>
        )}
      </div>
    </div>
  );
}