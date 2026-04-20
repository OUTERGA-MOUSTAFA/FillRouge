import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

// Correction des icônes Leaflet par défaut
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icône personnalisée pour les annonces
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Composant pour recentrer la carte
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Composant pour les marqueurs de recherche
function SearchMarker({ position, onDragEnd }) {
  const markerRef = useRef(null);
  
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.on('dragend', () => {
        const marker = markerRef.current;
        if (marker) {
          const latLng = marker.getLatLng();
          onDragEnd(latLng);
        }
      });
    }
  }, [onDragEnd]);
  
  return position ? (
    <Marker
      position={position}
      icon={customIcon}
      draggable={true}
      ref={markerRef}
    >
      <Popup>
        <div className="text-center">
          <p className="font-semibold">Position sélectionnée</p>
          <p className="text-xs text-gray-500">
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

// Composant principal
export default function MapComponent({ 
  listings = [], 
  center = [33.5731, -7.5898], // Centre du Maroc
  zoom = 6,
  onMarkerClick,
  onBoundsChange,
  height = "500px",
  showSearch = true,
  showUserLocation = true
}) {
  const [userPosition, setUserPosition] = useState(null);
  const [searchPosition, setSearchPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);

  // Obtenir la position de l'utilisateur
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setMapZoom(13);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  };

  // Gérer la recherche par adresse
  const handleAddressSearch = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setSearchPosition([parseFloat(lat), parseFloat(lon)]);
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setMapZoom(15);
      }
    } catch (error) {
      console.error('Erreur de recherche d\'adresse:', error);
    }
  };

  // Filtrer les annonces avec des coordonnées valides
  const validListings = listings.filter(listing => 
    listing.latitude && listing.longitude && listing.latitude !== 0 && listing.longitude !== 0
  );

  return (
    <div className="relative">
      {/* Contrôles de la carte */}
      {(showSearch || showUserLocation) && (
        <div className="absolute top-4 left-4 z-10 space-y-2">
          {/* Bouton position utilisateur */}
          {showUserLocation && (
            <button
              onClick={getUserLocation}
              className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
              title="Ma position"
            >
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}

          {/* Recherche d'adresse */}
          {showSearch && (
            <div className="flex">
              <input
                type="text"
                placeholder="Rechercher une adresse..."
                className="px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddressSearch(e.target.value);
                  }
                }}
                id="address-search"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('address-search');
                  handleAddressSearch(input.value);
                }}
                className="bg-primary-500 text-white px-3 py-2 rounded-r-lg hover:bg-primary-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Carte Leaflet */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: height, width: '100%', borderRadius: '12px' }}
        whenReady={() => {
          if (onBoundsChange) {
            const map = document.querySelector('.leaflet-container')._leaflet_map;
            if (map) {
              map.on('moveend', () => {
                const bounds = map.getBounds();
                onBoundsChange(bounds);
              });
            }
          }
        }}
      >
        <ChangeView center={mapCenter} zoom={mapZoom} />
        
        {/* Fond de carte */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marqueur de recherche */}
        <SearchMarker 
          position={searchPosition} 
          onDragEnd={(latLng) => {
            setSearchPosition([latLng.lat, latLng.lng]);
          }}
        />
        
        {/* Marqueur position utilisateur */}
        {userPosition && (
          <Circle
            center={userPosition}
            radius={100}
            pathOptions={{ color: '#009966', fillColor: '#00BBA7', fillOpacity: 0.2 }}
          />
        )}
        
        {/* Marqueurs des annonces */}
        {validListings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={customIcon}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(listing);
                }
              },
            }}
          >
            <Popup>
              <div className="max-w-xs">
                {listing.main_photo && (
                  <img 
                    src={listing.main_photo} 
                    alt={listing.title}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}
                <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                <p className="text-sm text-gray-600">{listing.city}</p>
                <p className="text-primary-600 font-bold mt-1">{listing.price} MAD/mois</p>
                <Link
                  to={`/listings/${listing.id}`}
                  className="inline-block mt-2 text-sm text-primary-500 hover:text-primary-600"
                >
                  Voir détails →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Légende */}
        <div className="leaflet-bottom leaflet-right">
          <div className="leaflet-control leaflet-bar bg-white p-2 rounded shadow-md m-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <span>Annonces</span>
              {userPosition && (
                <>
                  <div className="w-3 h-3 bg-blue-500 rounded-full ml-2"></div>
                  <span>Ma position</span>
                </>
              )}
            </div>
          </div>
        </div>
      </MapContainer>
    </div>
  );
}