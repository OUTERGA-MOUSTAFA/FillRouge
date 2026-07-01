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
import { useTranslation } from 'react-i18next';
import api from '../src/services/api';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// ==================== COMPOSANT ====================
export default function Home() {
  const { t } = useTranslation();
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==================== DONNÉES STATIQUES ====================
  const stats = [
    { value: '5000+', label: t('home.stats.activeListings') },
    { value: '10000+', label: t('home.stats.users') },
    { value: '50+', label: t('home.stats.citiesCovered') },
    { value: '95%', label: t('home.stats.satisfactionRate') },
  ];

  const features = [
    {
      name: t('home.features.smartSearch.name'),
      description: t('home.features.smartSearch.description'),
      icon: MagnifyingGlassIcon,
    },
    {
      name: t('home.features.verifiedListings.name'),
      description: t('home.features.verifiedListings.description'),
      icon: ShieldCheckIcon,
    },
    {
      name: t('home.features.secureMessaging.name'),
      description: t('home.features.secureMessaging.description'),
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: t('home.features.largeSelection.name'),
      description: t('home.features.largeSelection.description'),
      icon: BuildingOfficeIcon,
    },
  ];

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
      title: t('home.sliders.slide1.title'),
      subtitle: t('home.sliders.slide1.subtitle'),
      image: 'https://via.placeholder.com/1920x1080/16a34a/ffffff?text=Semsar+1',
      button_text: t('home.sliders.discover'),
      button_link: '/listings',
    },
    {
      id: 2,
      title: t('home.sliders.slide2.title'),
      subtitle: t('home.sliders.slide2.subtitle'),
      image: 'https://via.placeholder.com/1920x1080/16a34a/ffffff?text=Semsar+2',
      button_text: t('home.sliders.discover'),
      button_link: '/listings',
    },
    {
      id: 3,
      title: t('home.sliders.slide3.title'),
      subtitle: t('home.sliders.slide3.subtitle'),
      image: 'https://via.placeholder.com/1920x1080/16a34a/ffffff?text=Semsar+3',
      button_text: t('home.sliders.discover'),
      button_link: '/listings',
    },{
      id: 4,
      title: t('home.sliders.slide3.title'),
      subtitle: t('home.sliders.slide3.subtitle'),
      image: 'https://via.placeholder.com/1920x1080/16a34a/ffffff?text=Semsar+3',
      button_text: t('home.sliders.discover'),
      button_link: '/listings',
    },{
      id: 5,
      title: t('home.sliders.slide3.title'),
      subtitle: t('home.sliders.slide3.subtitle'),
      image: 'https://via.placeholder.com/1920x1080/16a34a/ffffff?text=Semsar+3',
      button_text: t('home.sliders.discover'),
      button_link: '/listings',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009966] mx-auto mb-4"></div>
          <p className="text-gray-600">{t('home.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-amber-300'>
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
                      e.target.src = 'https://via.placeholder.com/1920x1080/16a34a/ffffff?text=Semsar';
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
                      {slide.button_text || t('home.sliders.discover')}
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
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.features.subtitle')}
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
      <section className="bg-[#e6f7f5] py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t('home.cta.subtitle')}
          </p>
          <Link to="/register" className="btn-primary px-8 py-3 text-lg">
            {t('home.cta.button')}
          </Link>
        </div>
      </section>
    </div>
  );
}