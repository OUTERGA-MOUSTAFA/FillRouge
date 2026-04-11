import { useState, useEffect } from 'react';
import {
  UsersIcon, HomeIcon, FlagIcon, CurrencyDollarIcon,
  TrendingUpIcon, UserGroupIcon, EyeIcon, ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/admin';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await adminService.getStats(period);
      setStats(response.data);
    } catch (error) {
      toast.error('Erreur chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = stats ? [
    { title: 'Utilisateurs', value: stats.users.total, icon: UsersIcon, color: 'bg-blue-500', change: `+${stats.users.new} nouveaux` },
    { title: 'Annonces', value: stats.listings.total, icon: HomeIcon, color: 'bg-green-500', change: `${stats.listings.active} actives` },
    { title: 'Signalements', value: stats.reports.pending, icon: FlagIcon, color: 'bg-red-500', change: `${stats.reports.resolution_rate}% résolus` },
    { title: 'Revenus', value: `${stats.revenue.total} MAD`, icon: CurrencyDollarIcon, color: 'bg-yellow-500', change: `Premium: ${stats.users.premium}` },
  ] : [];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrateur</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="input w-40"
        >
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="year">Cette année</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => (
          <div key={stat.title} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* User Evolution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des inscriptions</h3>
          <div className="space-y-3">
            {stats.users.evolution.map((day) => (
              <div key={day.date} className="flex items-center">
                <span className="w-24 text-sm text-gray-600">{day.date}</span>
                <div className="flex-1 ml-4">
                  <div
                    className="bg-primary-500 h-8 rounded-lg"
                    style={{ width: `${(day.count / Math.max(...stats.users.evolution.map(d => d.count))) * 100}%` }}
                  >
                    <span className="text-white text-sm px-2 leading-8">{day.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cities */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 villes</h3>
          <div className="space-y-3">
            {stats.top_cities.map((city) => (
              <div key={city.city} className="flex items-center">
                <span className="w-32 text-sm text-gray-600">{city.city}</span>
                <div className="flex-1 ml-4">
                  <div
                    className="bg-secondary-500 h-8 rounded-lg"
                    style={{ width: `${(city.count / stats.top_cities[0].count) * 100}%` }}
                  >
                    <span className="text-white text-sm px-2 leading-8">{city.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenus par plan</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {stats.revenue.by_plan.map((plan) => (
            <div key={plan.plan} className="text-center">
              <p className="text-gray-500 capitalize">{plan.plan}</p>
              <p className="text-2xl font-bold text-gray-900">{plan.total} MAD</p>
            </div>
          ))}
          <div className="text-center border-l pl-6">
            <p className="text-gray-500">Moyenne par utilisateur</p>
            <p className="text-2xl font-bold text-gray-900">{stats.revenue.average_per_user} MAD</p>
          </div>
        </div>
      </div>
    </div>
  );
}