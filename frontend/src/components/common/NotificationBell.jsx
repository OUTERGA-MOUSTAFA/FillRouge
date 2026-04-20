import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../hooks/useNotifications';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return '💬';
      case 'match': return '❤️';
      case 'listing_match': return '🏠';
      case 'subscription_expiring': return '⚠️';
      case 'profile_reminder': return '📝';
      default: return '🔔';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMinutes = Math.floor((now - notifDate) / (1000 * 60));
    
    if (diffMinutes < 1) return 'à l\'instant';
    if (diffMinutes < 60) return `il y a ${diffMinutes} min`;
    if (diffMinutes < 1440) return `il y a ${Math.floor(diffMinutes / 60)}h`;
    return `il y a ${Math.floor(diffMinutes / 1440)}j`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 overflow-hidden">
          <div className="p-3 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <Link 
                to="/notifications" 
                className="text-xs text-[#009966] hover:text-[#00734d]"
                onClick={() => setIsOpen(false)}
              >
                Voir tout
              </Link>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                Aucune notification
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-[#e6f7f5]' : ''
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{notification.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTime(notification.created_at)}</p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-[#00BBA7] rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 5 && (
            <div className="p-2 border-t text-center">
              <Link 
                to="/notifications" 
                className="text-xs text-[#009966] hover:text-[#00734d]"
                onClick={() => setIsOpen(false)}
              >
                +{notifications.length - 5} notifications supplémentaires
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}