import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchesService } from '../src/services/matches';
import { usersService } from '../src/services/users';
import MatchCard from '../src/components/matches/MatchCard';
import RecommendationCard from '../src/components/matches/RecommendationCard';
import { useAuthStore } from '../src/store/authStore';
import toast from 'react-hot-toast';

export default function Matches() {
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
      console.error('Error fetching data:', error);
      const message = error.response?.data?.message || 'Erreur chargement des données';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (userId) => {
    try {
      await matchesService.accept(userId);
      toast.success('Match accepté !');
      fetchData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleDecline = async (userId) => {
    try {
      await matchesService.decline(userId);
      toast.success('Match refusé');
      fetchData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleMessage = (userId) => {
    navigate(`/messages/${userId}`);
  };

  const handleLike = async (userId) => {
    try {
      // Ici vous pouvez implémenter la logique pour liker une recommandation
      toast.success('Intérêt envoyé !');
      fetchData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BBA7]"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Matches & Recommandations</h1>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('matches')}
            className={`pb-3 font-medium ${activeTab === 'matches' ? 'text-[#009966] border-b-2 border-[#009966]' : 'text-gray-500'}`}
          >
            Mes matches ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`pb-3 font-medium ${activeTab === 'recommendations' ? 'text-[#009966] border-b-2 border-[#009966]' : 'text-gray-500'}`}
          >
            Recommandations ({recommendations.length})
          </button>
        </div>
      </div>

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">💔</div>
              <p className="text-gray-500 mb-2">Aucun match pour le moment</p>
              <p className="text-sm text-gray-400">
                Complétez votre profil pour recevoir des recommandations
              </p>
              {(!user?.profile?.interests || user.profile.interests.length === 0) && (
                <button
                  onClick={() => navigate('/profile/edit-details')}
                  className="mt-4 btn-primary text-sm"
                >
                  Compléter mon profil
                </button>
              )}
            </div>
          ) : (
            matches.map((match) => (
              <MatchCard
                key={match.user.id}
                match={match}
                onAccept={handleAccept}
                onDecline={handleDecline}
                onMessage={handleMessage}
              />
            ))
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 mb-2">Aucune recommandation pour le moment</p>
              <p className="text-sm text-gray-400">
                Complétez votre profil pour recevoir des suggestions
              </p>
              {(!user?.profile?.interests || user.profile.interests.length === 0) && (
                <button
                  onClick={() => navigate('/profile/edit-details')}
                  className="mt-4 btn-primary text-sm"
                >
                  Compléter mon profil
                </button>
              )}
            </div>
          ) : (
            recommendations.map((rec) => (
              <RecommendationCard
                key={rec.user.id}
                recommendation={rec}
                onLike={handleLike}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}