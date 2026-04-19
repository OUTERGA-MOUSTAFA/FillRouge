import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  EllipsisVerticalIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../src/store/authStore';
import { messagesService } from '../src/services/messages';
import MessageBubble from '../src/components/messages/MessageBubble';
import toast from 'react-hot-toast';

export default function Conversation() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  };

  const fetchConversation = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await messagesService.getConversation(userId);
      setOtherUser(response.data.user);
      setMessages(response.data.messages);
      if (!silent) setTimeout(() => scrollToBottom(false), 100);
    } catch (error) {
      if (!silent) {
        toast.error('Erreur chargement de la conversation');
        navigate('/messages');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (userId) fetchConversation();
  }, [userId, fetchConversation]);

  // Scroll to bottom when messages load
  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages.length]);

  // Polling every 2 seconds
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => fetchConversation(true), 2000);
    return () => clearInterval(interval);
  }, [userId, fetchConversation]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    const content = newMessage.trim();
    setNewMessage('');

    // Optimistic update
    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender_id: user?.id,
      receiver_id: parseInt(userId),
      content,
      created_at: new Date().toISOString(),
      is_read: false,
      attachments: [],
    };
    setMessages(prev => [...prev, tempMsg]);
    scrollToBottom();

    setSending(true);
    try {
      const response = await messagesService.send(userId, content);
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? response.data : m));
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setNewMessage(content);
      toast.error(error.response?.data?.message || 'Erreur envoi du message');
    } finally {
      setSending(false);
    }
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
    setSending(true);
    try {
      const response = await messagesService.send(userId, '', [file]);
      setMessages(prev => [...prev, response.data]);
      scrollToBottom();
    } catch (error) {
      toast.error('Erreur envoi de la pièce jointe');
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#009966]"></div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg">Select a conversation</p>
          <p className="text-sm mt-1">Choose from the list on the left</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <button
          onClick={() => navigate('/messages')}
          className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>

        <div className="relative">
          {otherUser.avatar ? (
            <img src={otherUser.avatar} alt={otherUser.full_name} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">{otherUser.full_name?.[0]}</span>
            </div>
          )}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
        </div>

        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">{otherUser.full_name}</p>
          <p className="text-xs text-green-500">Online</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/users/${userId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <UserCircleIcon className="h-4 w-4" />
            View Profile
          </Link>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            View Listing
          </button>
          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Safety notice */}
      <div className="mx-4 mb-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-2">
        <span className="text-amber-500 text-xs">🛡</span>
        <p className="text-xs text-amber-700">Never send payments outside the platform. Stay safe!</p>
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 shrink-0"
          >
            <PhotoIcon className="h-5 w-5" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Write your message..."
            rows={1}
            disabled={sending}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none max-h-32"
            style={{ lineHeight: '1.5' }}
          />

          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="p-2 bg-[#009966] text-white rounded-lg hover:bg-[#00734d] disabled:opacity-40 disabled:cursor-not-allowed shrink-0 transition-colors"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}