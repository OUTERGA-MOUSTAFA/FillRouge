import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../src/store/authStore';
import { messagesService } from '../src/services/messages';
import MessageBubble from '../src/components/messages/MessageBubble';
import AddReview from '../src/components/profile/AddReview';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const ROLE_LABELS = {
  semsar: { emoji: '🏠', cls: 'bg-blue-50 text-blue-600' },
  chercheur: { emoji: '🔍', cls: 'bg-purple-50 text-purple-600' },
  admin: { emoji: '👑', cls: 'bg-red-50 text-red-600' },
};

const DEMAND_BADGE = {
  pending: { cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  accepted: { cls: 'bg-green-50 text-green-700 border-green-200' },
  refused: { cls: 'bg-red-50 text-red-700 border-red-200' },
};

export default function Conversation() {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [demand, setDemand] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [responding, setResponding] = useState(false);
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
      setDemand(response.data.demand || null);
      if (!silent) setTimeout(() => scrollToBottom(false), 100);
    } catch (error) {
      if (!silent) {
        toast.error(t('messages.toast.load_error'));
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
      toast.error(error.response?.data?.message || t('messages.toast.send_error'));
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
      toast.error(t('messages.toast.attachment_error'));
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Le semsar accepte/refuse la demande de location
  const handleRespondDemand = async (action) => {
    if (!demand || responding) return;
    setResponding(true);
    try {
      await messagesService.respondDemand(demand.id, action);
      toast.success(action === 'accept' ? t('messages.demand.badge.accepted') : t('messages.demand.badge.refused'));
      fetchConversation(true); // rafraîchit messages + statut de la demande
    } catch (error) {
      toast.error(error.response?.data?.message || t('messages.toast.respond_error'));
    } finally {
      setResponding(false);
    }
  };

  // Rôles dans la demande de location
  const iAmSemsarOfDemand = demand && user?.id === demand.semsar_id;
  const demandStatus = demand?.status || null;
  // Le chercheur peut recommander un propriétaire (semsar)
  const canReview = user?.role === 'chercheur' && otherUser?.role === 'semsar';

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
          <p className="text-lg">{t('messages.empty.select_title')}</p>
          <p className="text-sm mt-1">{t('messages.empty.select_subtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate('/messages')}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>

          {/* Zone profil cliquable → ouvre le panneau */}
          <button
            onClick={() => setShowPanel(v => !v)}
            className="flex items-center gap-3 flex-1 min-w-0 text-left rounded-lg hover:bg-gray-50 p-1 -m-1 transition-colors"
          >
            <div className="relative shrink-0">
              {otherUser.avatar ? (
                <img src={otherUser.avatar} alt={otherUser.full_name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">{otherUser.full_name?.[0]}</span>
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate flex items-center gap-1.5">
                {otherUser.full_name}
                {otherUser.role && ROLE_LABELS[otherUser.role] && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${ROLE_LABELS[otherUser.role].cls}`}>
                    {ROLE_LABELS[otherUser.role].emoji} {t(`messages.roles.${otherUser.role}`)}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                {t('messages.profile.view_profile')}
                <ChevronDownIcon className={`h-3 w-3 transition-transform ${showPanel ? 'rotate-180' : ''}`} />
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/users/${userId}`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <UserCircleIcon className="h-4 w-4" /> {t('messages.profile.profile')}
            </Link>
            {demand?.listing && (
              <Link
                to={`/listings/${demand.listing.id}`}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4" /> {t('messages.profile.listing_link')}
              </Link>
            )}
          </div>
        </div>

        {/* Panneau profil + actions selon le rôle */}
        {showPanel && (
          <div className="px-4 pb-4 pt-1 bg-gray-50/60">
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              {/* Infos profil */}
              <div className="flex items-center gap-3">
                {otherUser.avatar ? (
                  <img src={otherUser.avatar} className="h-12 w-12 rounded-full object-cover" alt="" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-[#e6f7f5] flex items-center justify-center">
                    <span className="text-base font-bold text-[#00734d]">{otherUser.full_name?.[0]}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{otherUser.full_name}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    {otherUser.profession && <span className="text-xs text-gray-500">{otherUser.profession}</span>}
                    {otherUser.average_rating > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-gray-600">
                        <StarIcon className="h-3.5 w-3.5 text-amber-400" /> {otherUser.average_rating}
                      </span>
                    )}
                    {otherUser.is_premium && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">{t('messages.profile.premium')}</span>
                    )}
                    {otherUser.is_identity_verified && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                        <ShieldCheckIcon className="h-3 w-3" /> {t('messages.profile.verified')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Demande de location */}
              {demand && (
                <div className="border-t border-gray-100 pt-3">
                  {demand.listing && (
                    <p className="text-xs text-gray-500 mb-2">
                      {t('messages.demand.request_for')}{' '}
                      <Link to={`/listings/${demand.listing.id}`} className="font-medium text-[#009966] hover:underline">
                        {demand.listing.title}
                      </Link>
                    </p>
                  )}
                  {DEMAND_BADGE[demandStatus] && (
                    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${DEMAND_BADGE[demandStatus].cls}`}>
                      {t(`messages.demand.badge.${demandStatus}`)}
                    </span>
                  )}

                  {/* Le semsar accepte / refuse */}
                  {iAmSemsarOfDemand && demandStatus === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleRespondDemand('accept')}
                        disabled={responding}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#009966] text-white rounded-lg text-sm font-semibold hover:bg-[#00734d] disabled:opacity-50 transition-colors"
                      >
                        <CheckCircleIcon className="h-4 w-4" /> {t('messages.demand.accept')}
                      </button>
                      <button
                        onClick={() => handleRespondDemand('refuse')}
                        disabled={responding}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <XCircleIcon className="h-4 w-4" /> {t('messages.demand.refuse')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Le chercheur laisse une recommandation au propriétaire */}
              {canReview && (
                <div className="border-t border-gray-100 pt-3">
                  <button
                    onClick={() => setReviewOpen(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 border border-[#009966]/30 text-[#009966] rounded-lg text-sm font-semibold hover:bg-[#e6f7f5] transition-colors"
                  >
                    <StarIcon className="h-4 w-4" /> {t('messages.review.leave')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            {t('messages.chat.no_messages')}
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
        <p className="text-xs text-amber-700">{t('messages.chat.safety_notice')}</p>
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
            placeholder={t('messages.chat.write_placeholder')}
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

      {/* Modal de recommandation (chercheur → propriétaire) */}
      {reviewOpen && otherUser && (
        <AddReview
          targetUser={otherUser}
          listings={demand?.listing ? [demand.listing] : []}
          onClose={() => setReviewOpen(false)}
          onSuccess={() => toast.success(t('messages.review.success'))}
        />
      )}
    </div>
  );
}