import { Link } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function ConversationList({ conversations, currentUserId, loading }) {
  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const msgDate = new Date(date);
    const diffHours = (now - msgDate) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return msgDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return msgDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">Conversations</h2>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="font-semibold text-gray-900">Conversations</h2>
      </div>
      
      <div className="divide-y">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucune conversation
          </div>
        ) : (
          conversations.map((conv) => (
            <Link
              key={conv.user.id}
              to={`/messages/${conv.user.id}`}
              className={`block p-4 hover:bg-gray-50 transition-colors ${
                conv.unread_count > 0 ? 'bg-primary-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {conv.user.avatar ? (
                  <img
                    src={conv.user.avatar}
                    alt={conv.user.full_name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon className="h-12 w-12 text-gray-400" />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conv.user.full_name}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {conv.last_message && formatTime(conv.last_message.created_at)}
                    </span>
                  </div>
                  
                  {conv.last_message && (
                    <p className="text-sm text-gray-500 truncate">
                      {conv.last_message.sender_id === currentUserId ? 'Vous: ' : ''}
                      {conv.last_message.content}
                    </p>
                  )}
                  
                  {conv.unread_count > 0 && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}