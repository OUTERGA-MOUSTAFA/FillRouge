import { useState, useEffect } from 'react';
import {
  UsersIcon, HomeIcon, FlagIcon, CurrencyDollarIcon,
  ArrowTrendingUpIcon, UserGroupIcon, EyeIcon, ChatBubbleLeftRightIcon,
  CheckCircleIcon, ClockIcon, XCircleIcon, BuildingOfficeIcon,
  MapPinIcon, DocumentTextIcon, EnvelopeIcon, PhoneIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../src/services/admin';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentListings, setRecentListings] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [period] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, listingsRes, usersRes, reportsRes] = await Promise.all([
        adminService.getStats(period),
        adminService.getRecentListings(),
        adminService.getRecentUsers(),
        adminService.getPendingReports(),
      ]);
      setStats(statsRes.data);
      setRecentListings(listingsRes.data || []);
      setNewUsers(usersRes.data || []);
      setModerationQueue(reportsRes.data || []);
    } catch (error) {
      toast.error('Erreur chargement du dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = stats ? [
    { 
      title: 'Total Users', 
      value: stats.users.total, 
      change: '+12%', 
      icon: UsersIcon, 
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      title: 'Active Listings', 
      value: stats.listings.active, 
      change: '+8%', 
      icon: HomeIcon, 
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      title: 'Pending Approvals', 
      value: stats.reports.pending, 
      change: '-3%', 
      icon: FlagIcon, 
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    { 
      title: 'Monthly Revenue', 
      value: `${stats.revenue.total} MAD`, 
      change: '+24%', 
      icon: CurrencyDollarIcon, 
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    { 
      title: 'Support Tickets', 
      value: stats.reports.pending, 
      change: '+5%', 
      icon: ChatBubbleLeftRightIcon, 
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statsCards.map((stat) => (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <span className={`text-xs font-medium ${stat.textColor} mt-1 inline-block`}>
                    {stat.change}
                  </span>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
              <select className="text-sm border rounded-lg px-2 py-1">
                <option>Last 6 months</option>
                <option>Last year</option>
              </select>
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {stats?.users?.evolution?.map((item, index) => (
                <div key={index} className="flex-1 text-center">
                  <div 
                    className="bg-primary-500 rounded-t-lg transition-all hover:bg-primary-600"
                    style={{ height: `${(item.count / 250) * 200}px` }}
                  >
                    <span className="text-xs text-white font-medium -mt-5 block">{item.count}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{item.date?.slice(5, 7)}/{item.date?.slice(0, 4)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Cities Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Cities by Listings</h3>
            <div className="space-y-3">
              {stats?.top_cities?.map((city) => (
                <div key={city.city} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-gray-600 flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    {city.city}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-primary-400 h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium"
                      style={{ width: `${(city.count / stats.top_cities[0].count) * 100}%` }}
                    >
                      {city.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Room Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Type Distribution</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto relative">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" 
                    strokeDasharray={`${(450 / 920) * 251.2} 251.2`} transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" 
                    strokeDasharray={`${(280 / 920) * 251.2} 251.2`} strokeDashoffset={`-${(450 / 920) * 251.2}`} 
                    transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="20" 
                    strokeDasharray={`${(190 / 920) * 251.2} 251.2`} 
                    strokeDashoffset={`-${((450 + 280) / 920) * 251.2}`} transform="rotate(-90 50 50)" />
                </svg>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-sm">Private Room: 450</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm">Shared Room: 280</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-sm">Entire Place: 190</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Listings & New Users */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Listings */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Recent Listings</h3>
            </div>
            <div className="divide-y">
              {recentListings.slice(0, 5).map((listing) => (
                <div key={listing.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{listing.title}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPinIcon className="h-3 w-3" />
                        {listing.city} • {listing.user?.full_name}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      listing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {listing.status === 'active' ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {new Date(listing.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {recentListings.length === 0 && (
                <div className="p-8 text-center text-gray-500">Aucune annonce récente</div>
              )}
            </div>
          </div>

          {/* New Users */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">New Users</h3>
            </div>
            <div className="divide-y">
              {newUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UsersIcon className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{user.full_name}</h4>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        {user.email_verified_at ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {newUsers.length === 0 && (
                <div className="p-8 text-center text-gray-500">Aucun nouvel utilisateur</div>
              )}
            </div>
          </div>
        </div>

        {/* Moderation Queue */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Moderation Queue</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listing ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {moderationQueue.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">L-{report.listing_id || report.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{report.reportedUser?.full_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{report.reason}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(report.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {report.status === 'pending' ? 'Pending' : 'Reviewed'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
                {moderationQueue.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Aucun signalement en attente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-xs text-gray-400">
            Documentation | Help Center | Terms & Privacy
          </p>
          <p className="text-xs text-gray-400 mt-1">
            © 2025 Darna. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}