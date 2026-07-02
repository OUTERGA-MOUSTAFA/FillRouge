import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { matchesService } from '../src/services/matches';
import { usersService } from '../src/services/users';
import MatchCard from '../src/components/matches/MatchCard';
import RecommendationCard from '../src/components/matches/RecommendationCard';
import { useAuthStore } from '../src/store/authStore';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function Matches() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [matches, setMatches] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matchesRes, recosRes] = await Promise.all([
        matchesService.getMatches(),
        usersService.getRecommendations(),
      ]);
      setMatches(matchesRes.data || []);
      setRecommendations(recosRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || t('matches.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (userId) => {
    try {
      await matchesService.accept(userId);
      toast.success(t('matches.matchAccepted'));
      fetchData();
    } catch (error) {
      toast.error(t('matches.error'));
    }
  };

  const handleDecline = async (userId) => {
    try {
      await matchesService.decline(userId);
      toast.success(t('matches.matchDeclined'));
      fetchData();
    } catch (error) {
      toast.error(t('matches.error'));
    }
  };

  const handleMessage = (userId) => navigate(`/messages/${userId}`);

  const handleLike = async () => {
    try {
      toast.success(t('matches.interestSent'));
      fetchData();
    } catch (error) {
      toast.error(t('matches.error'));
    }
  };

  const TABS = [
    { key: 'matches', label: t('matches.tabMatches', { count: matches.length }), icon: HeartIcon },
    { key: 'recommendations', label: t('matches.tabRecommendations', { count: recommendations.length }), icon: SparklesIcon },
  ];

  const EmptyState = ({ emoji, text, hint }) => (
    <div className="bg-white rounded-2xl border border-gray-100 py-16 px-6 text-center max-w-lg mx-auto">
      <div className="text-5xl mb-4">{emoji}</div>
      <p className="text-gray-700 font-medium mb-1">{text}</p>
      <p className="text-sm text-gray-400">{hint}</p>
      {(!user?.profile?.interests || user.profile.interests.length === 0) && (
        <button
          onClick={() => navigate('/profile/edit-details')}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#009966] text-white rounded-xl text-sm font-semibold hover:bg-[#00734d] transition-colors shadow-sm"
        >
          {t('matches.completeMyProfile')}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero header ── */}
      <div className="bg-gradient-to-r from-[#009966] to-[#00BBA7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
              <HeartIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('matches.title')}</h1>
              <p className="text-white/80 text-sm mt-0.5 max-w-xl">{t('matches.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Pill tabs ── */}
        <div className="inline-flex p-1 bg-white rounded-xl border border-gray-100 shadow-sm mb-8">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  active ? 'bg-[#009966] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'matches' ? (
          matches.length === 0 ? (
            <EmptyState emoji="💔" text={t('matches.noMatches')} hint={t('matches.completeProfileRecommendations')} />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {matches.map((match) => (
                <MatchCard
                  key={match.user.id}
                  match={match}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  onMessage={handleMessage}
                />
              ))}
            </div>
          )
        ) : recommendations.length === 0 ? (
          <EmptyState emoji="🔍" text={t('matches.noRecommendations')} hint={t('matches.completeProfileSuggestions')} />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.user.id} recommendation={rec} onLike={handleLike} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
