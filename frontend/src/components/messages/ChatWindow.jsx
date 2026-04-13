import { useRef, useEffect, useState } from 'react'; // useState ajouté
import { PaperAirplaneIcon, PhotoIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages, currentUserId, otherUser, onSendMessage, onSendAttachment, sending }) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    await onSendMessage(newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await onSendAttachment(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
        {otherUser?.avatar ? (
          <img
            src={otherUser.avatar}
            alt={otherUser.full_name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <UserCircleIcon className="h-10 w-10 text-gray-400" />
        )}
        <div>
          <h3 className="font-semibold text-gray-900">{otherUser?.full_name}</h3>
          <p className="text-xs text-gray-500">
            {otherUser?.is_online ? 'En ligne' : 'Hors ligne'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Aucun message. Commencez la conversation !
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-primary-600 rounded-lg hover:bg-gray-100"
          >
            <PhotoIcon className="h-5 w-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message..."
            className="flex-1 input resize-none"
            rows="1"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="btn-primary px-4 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}