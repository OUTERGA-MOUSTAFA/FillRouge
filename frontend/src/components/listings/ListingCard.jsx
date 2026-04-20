import { Link } from 'react-router-dom';
import { MapPinIcon, HomeIcon, UserIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

export default function ListingCard({ listing, featured = false }) {
  const mainPhoto = listing.main_photo || listing.photos?.[0];

  const typeLabel = {
    room: 'Chambre',
    apartment: 'Appartement',
    looking_for_roommate: 'Cherche coloc',
  }[listing.type] || listing.type;

  return (
    <Link to={`/listings/${listing.id}`} className="block group">
      <div className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
        featured ? 'ring-2 ring-[#009966]' : 'border border-gray-100'
      }`}>

        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          {mainPhoto ? (
            <img
              src={mainPhoto}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HomeIcon className="h-12 w-12 text-gray-300" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {featured && (
              <span className="bg-[#009966] text-white text-xs font-medium px-2.5 py-1 rounded-full">
                ⭐ En avant
              </span>
            )}
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {typeLabel}
            </span>
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5">
            <span className="text-[#009966] font-bold text-sm">
              {listing.price?.toLocaleString()} MAD
            </span>
            <span className="text-gray-400 text-xs">/mois</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-[#009966] transition-colors line-clamp-1 mb-1">
            {listing.title}
          </h3>

          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPinIcon className="h-3.5 w-3.5 mr-1 shrink-0 text-[#009966]" />
            <span className="line-clamp-1">
              {listing.neighborhood ? `${listing.neighborhood}, ` : ''}{listing.city}
            </span>
          </div>

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {listing.amenities.slice(0, 3).map((amenity) => (
                <span key={amenity} className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-gray-500 text-xs rounded-lg capitalize">
                  {amenity.replace(/_/g, ' ')}
                </span>
              ))}
              {listing.amenities.length > 3 && (
                <span className="px-2 py-0.5 text-gray-400 text-xs">
                  +{listing.amenities.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Host */}
          {listing.user && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {listing.user.avatar ? (
                  <img src={listing.user.avatar} className="h-6 w-6 rounded-full object-cover" alt="" />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                )}
                <span className="truncate max-w-[120px]">{listing.user.full_name}</span>
              </div>

              <div className="flex items-center gap-1">
                {listing.user.is_premium && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Premium</span>
                )}
                {listing.user.average_rating > 0 && (
                  <div className="flex items-center gap-0.5 text-xs text-gray-500">
                    <StarSolid className="h-3 w-3 text-amber-400" />
                    {listing.user.average_rating}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}