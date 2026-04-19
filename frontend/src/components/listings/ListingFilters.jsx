import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

const cities = ['Agadir', 'Tanger', 'Fès', 'Meknès', 'Marrakech', 'Casablanca', 'Rabat', 'Essaouira', 'Tétouan', 'Oujda'];
const amenities = ['WiFi', 'AC', 'Parking', 'Furnished', 'Workspace', 'Kitchen', 'Garden'];

export default function ListingFilters({ isOpen, onClose, onApply }) {
  const [filters, setFilters] = useState({
    city: '',
    min_price: 0,
    max_price: 10000,
    type: '',
    amenities: [],
  });

  const handleAmenityToggle = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      city: '',
      min_price: 0,
      max_price: 10000,
      type: '',
      amenities: [],
    });
    onApply({});
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                    <FunnelIcon className="h-5 w-5 inline mr-2" />
                    Filtres
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Ville */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                    <select
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      className="input"
                    >
                      <option value="">Toutes les villes</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget (MAD/mois): {filters.min_price} - {filters.max_price}
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="range"
                        min="0"
                        max="25000"
                        step="500"
                        value={filters.min_price}
                        onChange={(e) => setFilters({ ...filters, min_price: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-4 mt-2">
                      <input
                        type="number"
                        value={filters.min_price}
                        onChange={(e) => setFilters({ ...filters, min_price: parseInt(e.target.value) })}
                        className="input w-1/2"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        value={filters.max_price}
                        onChange={(e) => setFilters({ ...filters, max_price: parseInt(e.target.value) })}
                        className="input w-1/2"
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  {/* Type de logement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type de logement</label>
                    <div className="flex gap-3">
                      {['room', 'apartment', 'looking_for_roommate'].map(type => (
                        <button
                          key={type}
                          onClick={() => setFilters({ ...filters, type: filters.type === type ? '' : type })}
                          className={`px-3 py-1 rounded-full text-sm ${
                            filters.type === type
                              ? 'bg-[#00BBA7] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {type === 'room' ? 'Chambre' : type === 'apartment' ? 'Appartement' : 'Cherche coloc'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Commodités */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Commodités</label>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map(amenity => (
                        <button
                          key={amenity}
                          onClick={() => handleAmenityToggle(amenity)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            filters.amenities.includes(amenity)
                              ? 'bg-[#00BBA7] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {amenity}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <button onClick={handleReset} className="flex-1 btn-secondary">
                    Réinitialiser
                  </button>
                  <button onClick={handleApply} className="flex-1 btn-primary">
                    Appliquer
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}