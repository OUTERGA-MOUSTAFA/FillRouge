import { Link } from 'react-router-dom';
import { MapPinIcon, HomeIcon, UserIcon } from '@heroicons/react/24/outline';

export default function ListingCard({ listing, featured = false }) {
  const mainPhoto = listing.main_photo || listing.photos?.[0];
  
  return (
    <Link to={`/listings/${listing.id}`} className="block group">
      <div className={`card ${featured ? 'ring-2 ring-[#00BBA7]' : ''}`}>
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          {mainPhoto ? (
            <img
              src={mainPhoto}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <HomeIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
          {featured && (
            <div className="absolute top-2 left-2 bg-[#00BBA7] text-white px-2 py-1 rounded-md text-xs font-semibold">
              ⭐ Mis en avant
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs">
            {listing.type === 'room' ? 'Chambre' : listing.type === 'apartment' ? 'Appartement' : 'Cherche coloc'}
          </div>
        </div>
        
        {/* Contenu */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-(#009966) transition-colors line-clamp-1">
              {listing.title}
            </h3>
            <span className="text-(#009966) font-bold">
              {listing.price.toLocaleString()} MAD
              <span className="text-xs text-gray-500 font-normal">/mois</span>
            </span>
          </div>
          
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">
              {listing.neighborhood ? `${listing.neighborhood}, ` : ''}{listing.city}
            </span>
          </div>
          
          {/* Amenities */}
          <div className="flex flex-wrap gap-1 mt-3">
            {listing.amenities?.slice(0, 3).map((amenity) => (
              <span key={amenity} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                {amenity}
              </span>
            ))}
            {listing.amenities?.length > 3 && (
              <span className="text-xs text-gray-400">+{listing.amenities.length - 3}</span>
            )}
          </div>
          
          {/* Hôte */}
          {listing.user && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <UserIcon className="h-4 w-4 mr-1" />
                <span>Hébergé par {listing.user.full_name}</span>
              </div>
              {listing.user.is_premium && (
                <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">Premium</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}