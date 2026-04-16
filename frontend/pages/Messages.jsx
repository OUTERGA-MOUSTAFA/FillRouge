import { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useMessages } from '../src/hooks/useMessages';
import { useAuthStore } from '../src/store/authStore';
import ConversationList from '../src/components/messages/ConversationList';

export default function Messages() {
  const { user } = useAuthStore();
  const { conversations, fetchConversations, loading } = useMessages();

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messagerie</h1>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <ConversationList
            conversations={conversations}
            currentUserId={user?.id}
            loading={loading}
          />
        </div>
        
        {/* Chat Window */}
        <div className="lg:col-span-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
}