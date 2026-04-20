import ListingCard from './ListingCard';

export default function ListingGrid({ listings, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BBA7]"></div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune annonce trouvée</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">77777777777777777777777
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} featured={listing.is_featured} />
      ))}
    </div>
  );
}