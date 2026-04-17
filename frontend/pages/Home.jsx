import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  BuildingOfficeIcon, 
  ShieldCheckIcon, 
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { useState, useEffect } from 'react';
import api from '../src/services/api';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// ==================== DONNÉES STATIQUES ====================
const stats = [
  { value: '5000+', label: 'Annonces actives' },
  { value: '10000+', label: 'Utilisateurs' },
  { value: '50+', label: 'Villes couvertes' },
  { value: '95%', label: 'Taux de satisfaction' },
];

const features = [
  {
    name: 'Recherche intelligente',
    description: 'Trouvez le colocataire idéal grâce à notre algorithme de matching avancé.',
    icon: MagnifyingGlassIcon,
  },
  {
    name: 'Annonces vérifiées',
    description: 'Toutes nos annonces sont vérifiées pour votre sécurité.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Messagerie sécurisée',
    description: 'Communiquez en toute sécurité avec vos futurs colocataires.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: 'Large sélection',
    description: 'Des milliers d\'annonces dans toutes les villes du Maroc.',
    icon: BuildingOfficeIcon,
  },
];

// ==================== COMPOSANT ====================
export default function Home() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/sliders');
      
      if (response.data.success && response.data.data.length > 0) {
        setSliders(response.data.data);
      } else {
        // Fallback si pas de données
        setSliders(getDefaultSliders());
      }
    } catch (error) {
      console.error('Erreur chargement sliders:', error);
      setSliders(getDefaultSliders());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSliders = () => [
    {
      id: 1,
      title: 'Trouvez votre espace idéal',
      subtitle: 'Des milliers d\'annonces à Casablanca, Rabat et partout au Maroc',
      image: 'https://via.placeholder.com/1920x1080/16a34a/ffffff?text=Darna+1',
      button_text: 'Découvrir',
      button_link: '/listings',
    },
    {
      id: 2,
      title: 'Colocation sécurisée',
      subtitle: 'Annonces vérifiées et profils authentifiés pour votre tranquillité',
      image: 'https://via.placeholder.com/1920x1080/16a34a/ffffff?text=Darna+2',
      button_text: 'Découvrir',
      button_link: '/listings',
    },
    {
      id: 3,
      title: 'La communauté Darna',
      subtitle: 'Rejoignez plus de 10,000 membres à la recherche du colocataire parfait',
      image: 'https://via.placeholder.com/1920x1080/16a34a/ffffff?text=Darna+3',
      button_text: 'Découvrir',
      button_link: '/listings',
    },{
      id: 4,
      title: 'La communauté Darna',
      subtitle: 'Rejoignez plus de 10,000 membres à la recherche du colocataire parfait',
      image: 'https://via.placeholder.com/1920x1080/16a34a/ffffff?text=Darna+3',
      button_text: 'Découvrir',
      button_link: '/listings',
    },{
      id: 5,
      title: 'La communauté Darna',
      subtitle: 'Rejoignez plus de 10,000 membres à la recherche du colocataire parfait',
      image: 'https://via.placeholder.com/1920x1080/16a34a/ffffff?text=Darna+3',
      button_text: 'Découvrir',
      button_link: '/listings',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009966] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ========== CAROUSEL SECTION ========== */}
      {sliders.length > 0 && (
        <section className="relative">
          <Swiper
            spaceBetween={0}
            centeredSlides={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{ clickable: true }}
            navigation={true}
            modules={[Autoplay, Pagination, Navigation]}
            className="mySwiper h-[500px] md:h-[600px]"
          >
            {sliders.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="relative w-full h-full">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    loading={slide.id === sliders[0]?.id ? 'eager' : 'lazy'}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/1920x1080/16a34a/ffffff?text=Darna';
                    }}
                  />
                  {/* Overlay - CORRIGÉ: bg-black/40 au lieu de bg-green-400 */}
                  <div className="absolute inset-0 bg-black/40" />
                  
                  {/* Contenu texte */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                      {slide.title}
                    </h2>
                    <p className="text-lg md:text-xl max-w-2xl drop-shadow">
                      {slide.subtitle}
                    </p>
                    <Link
                      to={slide.button_link || '/listings'}
                      className="mt-8 bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition"
                    >
                      {slide.button_text || 'Découvrir'}
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* ========== STATS SECTION ========== */}
      <section className="bg-white py-12 border-b">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-[#009966]">{stat.value}</div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Darna ?
            </h2>
            <p className="text-xl text-gray-600">
              Une plateforme complète pour votre recherche de colocataire
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="text-center">
                <div className="inline-flex items-center justify-center p-3 bg-[#ccefeb] rounded-full mb-4">
                  <feature.icon className="h-6 w-6 text-[#009966]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="bg-primary-50 py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Prêt à trouver votre colocataire ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Rejoignez la plus grande communauté de colocation au Maroc
          </p>
          <Link to="/register" className="btn-primary px-8 py-3 text-lg">
            Commencer maintenant
          </Link>
        </div>
      </section>
    </div>
  );
}