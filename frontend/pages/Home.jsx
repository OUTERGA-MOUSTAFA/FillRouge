import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, BuildingOfficeIcon, ShieldCheckIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

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

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container-custom py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Trouvez votre colocataire idéal au Maroc
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Darna vous aide à trouver la personne parfaite pour partager votre logement,
              en toute sécurité et simplicité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/listings" className="btn-white bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold">
                Explorer les annonces
              </Link>
              <Link to="/register" className="btn-outline-white border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold">
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 border-b">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600">5000+</div>
              <div className="text-gray-600 mt-1">Annonces actives</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">10000+</div>
              <div className="text-gray-600 mt-1">Utilisateurs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">50+</div>
              <div className="text-gray-600 mt-1">Villes couvertes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">95%</div>
              <div className="text-gray-600 mt-1">Taux de satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir Darna ?</h2>
            <p className="text-xl text-gray-600">Une plateforme complète pour votre recherche de colocataire</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="text-center">
                <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.name}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-50 py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Prêt à trouver votre colocataire ?</h2>
          <p className="text-xl text-gray-600 mb-8">Rejoignez la plus grande communauté de colocation au Maroc</p>
          <Link to="/register" className="btn-primary px-8 py-3 text-lg">
            Commencer maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}