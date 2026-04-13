import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchesService } from '../src/services/matches';
import { usersService } from '../src/services/users';
import MatchCard from '../src/components/matches/MatchCard';
import RecommendationCard from '../src/components/matches/RecommendationCard';
import toast from 'react-hot-toast';

export default function Matches() {
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
      const message = error.response?.data?.message || 'Erreur';
      toast.error(message);
    }
  };

  const handleDecline = async (userId) => {
    try {
      await matchesService.decline(userId);
      toast.success('Match refusé');
      fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur';
      toast.error(message);
    }
  };

  const handleMessage = (userId) => {
    navigate(`/messages/${userId}`);
  };

  const handleLike = async (userId) => {
    try {
      toast.success('Intérêt envoyé !');
      fetchData();
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Matches & Recommandations</h1>

      <div className="border-b mb-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('matches')}
            className={`pb-3 font-medium ${activeTab === 'matches' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
          >
            Mes matches ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`pb-3 font-medium ${activeTab === 'recommendations' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
          >
            Recommandations ({recommendations.length})
          </button>
        </div>
      </div>

      {activeTab === 'matches' && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-500">Aucun match pour le moment</p>
              <p className="text-sm text-gray-400 mt-2">
                Complétez votre profil pour recevoir des recommandations
              </p>
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

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-500">Aucune recommandation pour le moment</p>
              <p className="text-sm text-gray-400 mt-2">
                Complétez votre profil pour recevoir des suggestions
              </p>
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