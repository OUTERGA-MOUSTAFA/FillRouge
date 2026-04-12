import { useNotifications } from '../src/hooks/useNotifications';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Notifications() {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

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

    return (
        <div className="container-custom py-8 max-w-3xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <BellIcon className="h-8 w-8 text-primary-500" />
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="bg-primary-500 text-white px-2 py-1 rounded-full text-xs">
                            {unreadCount} non lues
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-primary-600 hover:text-primary-700 text-sm">
                        Tout marquer comme lu
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="card p-12 text-center">
                        <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Aucune notification pour le moment</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`card p-4 transition-all ${!notification.is_read ? 'bg-primary-50 border-primary-200' : ''}`}
                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                        >
                            <div className="flex items-start gap-4">
                                <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                    <p className="text-gray-600 text-sm mt-1">{notification.content}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                </div>
                                {!notification.is_read && (
                                    <CheckCircleIcon className="h-5 w-5 text-primary-500" />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}