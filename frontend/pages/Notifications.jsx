import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BellIcon, CheckIcon, TrashIcon,
  ChatBubbleLeftRightIcon, HeartIcon, HomeIcon,
  ExclamationTriangleIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useNotifications } from '../src/hooks/useNotifications';
import { notificationsService } from '../src/services/notifications';
import toast from 'react-hot-toast';

// ─── Notification type config ────────────────────────────────────────────────
const TYPE_CONFIG = {
  message: {
    icon: ChatBubbleLeftRightIcon,
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    label: 'Message',
  },
  match: {
    icon: HeartIcon,
    bg: 'bg-pink-50',
    iconColor: 'text-pink-500',
    label: 'Match',
  },
  listing_match: {
    icon: HomeIcon,
    bg: 'bg-[#e6f7f5]',
    iconColor: 'text-[#009966]',
    label: 'Annonce',
  },
  subscription_expiring: {
    icon: ExclamationTriangleIcon,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    label: 'Abonnement',
  },
  profile_reminder: {
    icon: DocumentTextIcon,
    bg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    label: 'Profil',
  },
};

const DEFAULT_CONFIG = {
  icon: BellIcon,
  bg: 'bg-gray-100',
  iconColor: 'text-gray-500',
  label: 'Notification',
};

// ─── Time formatter ──────────────────────────────────────────────────────────
function formatTime(date) {
  const now = new Date();
  const d = new Date(date);
  const diffMin = Math.floor((now - d) / 60000);
  if (diffMin < 1) return 'à l\'instant';
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffMin < 1440) return `il y a ${Math.floor(diffMin / 60)}h`;
  if (diffMin < 10080) return `il y a ${Math.floor(diffMin / 1440)}j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// ─── Group notifications by date ─────────────────────────────────────────────
function groupByDate(notifications) {
  const groups = {};
  notifications.forEach(n => {
    const d = new Date(n.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key;
    if (d.toDateString() === today.toDateString()) key = "Aujourd'hui";
    else if (d.toDateString() === yesterday.toDateString()) key = 'Hier';
    else key = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });
  return groups;
}

// ─── Single notification card ─────────────────────────────────────────────────
function NotificationItem({ notification, onMarkRead, onDelete }) {
  const config = TYPE_CONFIG[notification.type] || DEFAULT_CONFIG;
  const Icon = config.icon;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    try {
      await notificationsService.delete(notification.id);
      onDelete(notification.id, !notification.is_read);
    } catch {
      toast.error('Erreur suppression');
      setDeleting(false);
    }
  };

  // Determine action link based on notification type + data
  const getLink = () => {
    const data = notification.data || {};
    if (notification.type === 'message' && data.sender_id) return `/messages/${data.sender_id}`;
    if (notification.type === 'listing_match' && data.listing_id) return `/listings/${data.listing_id}`;
    if (notification.type === 'match' && data.matched_user_id) return `/users/${data.matched_user_id}`;
    if (notification.type === 'subscription_expiring') return '/subscription/plans';
    if (notification.type === 'profile_reminder') return '/profile/edit';
    return null;
  };

  const link = getLink();

  const content = (
    <div
      className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer
        ${!notification.is_read
          ? 'bg-[#f0faf6] border-[#b3e8d8] hover:bg-[#e6f7f5]'
          : 'bg-white border-gray-100 hover:bg-gray-50'
        }
        ${deleting ? 'opacity-40 pointer-events-none' : ''}
      `}
      onClick={() => !notification.is_read && onMarkRead(notification.id)}
    >
      {/* Icon */}
      <div className={`shrink-0 h-10 w-10 rounded-full ${config.bg} flex items-center justify-center`}>
        <Icon className={`h-5 w-5 ${config.iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-snug ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
            {notification.title}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-gray-400 whitespace-nowrap">{formatTime(notification.created_at)}</span>
            {!notification.is_read && (
              <span className="h-2 w-2 rounded-full bg-[#009966] shrink-0"></span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
          {notification.content}
        </p>

        {/* Action row */}
        <div className="flex items-center gap-3 mt-2">
          {/* Type badge */}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.bg} ${config.iconColor}`}>
            {config.label}
          </span>

          {/* Mark as read */}
          {!notification.is_read && (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
              className="text-xs text-[#009966] hover:text-[#00734d] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <CheckIcon className="h-3 w-3" /> Marquer comme lu
            </button>
          )}

          {/* Go to link */}
          {link && (
            <Link
              to={link}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-gray-400 hover:text-[#009966] transition-colors opacity-0 group-hover:opacity-100"
            >
              Voir →
            </Link>
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
        title="Supprimer"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );

  // Wrap in Link if there's an action destination
  return link ? (
    <Link to={link} className="block no-underline">
      {content}
    </Link>
  ) : content;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Notifications() {
  const {
    notifications, unreadCount, loading,
    markAsRead, markAllAsRead, fetchNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  // Handle delete locally (remove from list + adjust unread count)
  const handleDelete = (id, wasUnread) => {
    // Re-fetch to sync with backend
    fetchNotifications();
  };

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const grouped = groupByDate(filtered);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#e6f7f5] rounded-xl flex items-center justify-center">
              <BellIcon className="h-5 w-5 text-[#009966]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#009966] hover:text-[#00734d] border border-[#009966]/30 hover:bg-[#e6f7f5] rounded-lg transition-all"
            >
              <CheckIcon className="h-4 w-4" />
              Tout marquer lu
            </button>
          )}
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'Toutes', count: notifications.length },
            { key: 'unread', label: 'Non lues', count: unreadCount },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-[#009966] text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-[#009966]/40'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#009966]"></div>
          </div>

        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellIcon className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">
              {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification pour le moment'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Vous serez notifié ici des nouveaux messages, matches et mises à jour.
            </p>
          </div>

        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                {/* Date group header */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
                  {dateLabel}
                </p>
                <div className="space-y-2">
                  {items.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={markAsRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}