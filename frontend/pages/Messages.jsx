import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useMessages } from '../src/hooks/useMessages';
import { useAuthStore } from '../src/store/authStore';
import ConversationList from '../src/components/messages/ConversationList';

export default function Messages() {
  const { user } = useAuthStore();
  const { conversations, fetchConversations, loading } = useMessages();
  const { userId } = useParams();

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto h-[calc(100vh-64px)] flex">
        {/* Sidebar */}
        <div className={`${userId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-gray-200 bg-white`}>
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <div className="mt-3">
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#009966]/20"
              />
            </div>
            <div className="flex gap-2 mt-3">
              {['Hosts', 'Guests', 'Unread'].map(tab => (
                <button
                  key={tab}
                  className="px-4 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              currentUserId={user?.id}
              loading={loading}
              activeUserId={userId ? parseInt(userId) : null}
            />
          </div>
        </div>

        {/* Chat area */}
        <div className={`${userId ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}