import { Link } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function ConversationList({ conversations, currentUserId, loading, activeUserId }) {
  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const msgDate = new Date(date);
    const diffMins = Math.floor((now - msgDate) / 60000);
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009966] mx-auto"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        No conversations yet
      </div>
    );
  }

  return (
    <div>
      {conversations.map((conv) => {
        const isActive = activeUserId === conv.user.id;
        return (
          <Link
            key={conv.user.id}
            to={`/messages/${conv.user.id}`}
            className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
              isActive ? 'bg-[#f0faf6]' : ''
            }`}
          >
            {/* Avatar with online indicator */}
            <div className="relative shrink-0">
              {conv.user.avatar ? (
                <img
                  src={conv.user.avatar}
                  alt={conv.user.full_name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {conv.user.full_name?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              {/* Online dot */}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <p className="font-medium text-gray-900 truncate text-sm">{conv.user.full_name}</p>
                <span className="text-xs text-gray-400 shrink-0 ml-2">
                  {conv.last_message && formatTime(conv.last_message.created_at)}
                </span>
              </div>

              {/* Listing context */}
              {conv.last_message?.listing && (
                <p className="text-xs text-[#009966] truncate">{conv.last_message.listing.title}</p>
              )}

              {/* Last message */}
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {conv.last_message?.sender_id === currentUserId ? '' : ''}
                {conv.last_message?.content || ''}
              </p>
            </div>

            {/* Unread badge */}
            {conv.unread_count > 0 && (
              <span className="shrink-0 h-5 w-5 rounded-full bg-[#009966] text-white text-xs flex items-center justify-center">
                {conv.unread_count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}