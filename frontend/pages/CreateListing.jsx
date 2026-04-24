import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { listingsService } from "../src/services/listings";
import {
  XMarkIcon,
  MapPinIcon,
  HomeIcon,
  WifiIcon,
  FireIcon,
  DevicePhoneMobileIcon,
  BuildingStorefrontIcon,
  UserIcon,
  HomeModernIcon,
  BuildingOffice2Icon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const citiesList = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Tanger",
  "Agadir",
  "Fès",
  "Meknès",
  "Oujda",
];

const amenitiesList = [
  { id: "wifi", name: "WiFi", icon: WifiIcon },
  { id: "ac", name: "Climatisation", icon: FireIcon },
  { id: "parking", name: "Parking", icon: BuildingStorefrontIcon },
  { id: "tv", name: "TV", icon: DevicePhoneMobileIcon },
  { id: "kitchen", name: "Cuisine équipée", icon: HomeIcon },
  { id: "pets", name: "Animaux acceptés", icon: UserIcon },
  { id: "washing_machine", name: "Machine à laver", icon: CpuChipIcon },
];

// Types d'annonces disponibles
const listingTypes = [
  { id: "room", name: "Chambre", icon: HomeIcon, description: "Chambre individuelle dans un appartement/maison" },
  { id: "apartment", name: "Appartement", icon: BuildingOffice2Icon, description: "Appartement entier" },
  { id: "house", name: "Maison", icon: HomeModernIcon, description: "Maison entière" },
  // { id: "studio", name: "Studio", icon: HomeIcon, description: "Studio meublé" },
];

export default function CreateListing() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [form, setForm] = useState({
    type: "room", // Ajout du champ type
    title: "",
    description: "",
    city: "",
    price: "",
    available_from: "",
    furnished: false,
    amenities: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const toggleAmenity = (id) => {
    if (form.amenities.includes(id)) {
      setForm({
        ...form,
        amenities: form.amenities.filter((x) => x !== id),
      });
    } else {
      setForm({
        ...form,
        amenities: [...form.amenities, id],
      });
    }
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + photos.length > 10) {
      toast.error("Maximum 10 photos");
      return;
    }

    setPhotos([...photos, ...files]);

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...urls]);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.type) {
        toast.error("Veuillez choisir un type d'annonce");
        return false;
      }
      if (!form.title || !form.title.trim()) {
        toast.error("Le titre est requis");
        return false;
      }
      if (!form.description || !form.description.trim()) {
        toast.error("La description est requise");
        return false;
      }
    }

    if (step === 2) {
      if (!form.city) {
        toast.error("Veuillez choisir une ville");
        return false;
      }
    }

    if (step === 3) {
      if (!form.price || form.price <= 0) {
        toast.error("Le prix est requis et doit être supérieur à 0");
        return false;
      }
      if (!form.available_from) {
        toast.error("La date de disponibilité est requise");
        return false;
      }
    }

    if (step === 4 && photos.length < 3) {
      toast.error("Minimum 3 photos requises");
      return false;
    }

    return true;
  };

  const next = () => {
    if (validateStep()) setStep(step + 1);
  };

  const prev = () => setStep(step - 1);

  const submit = async (e) => {
    e.preventDefault();

    if (!validateStep()) return;

    setLoading(true);

    const fd = new FormData();

    // Champs principaux
    fd.append('type', form.type);
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('city', form.city);
    fd.append('available_from', form.available_from);
    fd.append('furnished', form.furnished ? '1' : '0');

    // Aménités
    form.amenities.forEach((amenity) => {
      fd.append('amenities[]', amenity);
    });

    // Photos
    photos.forEach((photo) => {
      fd.append('photos[]', photo);
    });

    try {
      await listingsService.create(fd);
      toast.success("Annonce créée avec succès !");
      navigate("/MyListings");
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach(msg => toast.error(msg));
      } else {
        toast.error(error.response?.data?.message || "Erreur lors de la création");
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Type & Info", "Localisation", "Prix & Disponibilité", "Photos & Détails"];

  // Trouver l'icône du type sélectionné
  // const getSelectedTypeIcon = () => {
  //   const selected = listingTypes.find(t => t.id === form.type);
  //   const Icon = selected?.icon || HomeIcon;
  //   return <Icon className="w-5 h-5" />;
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900">
            Publier une annonce
          </h1>
          <p className="text-slate-500 mt-2">
            Créez votre annonce en quelques étapes
          </p>
        </div>

        {/* Progress bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {steps.map((item, index) => (
            <div key={index}>
              <div
                className={`h-2 rounded-full transition-all ${
                  step >= index + 1 ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
              <p className="text-xs mt-2 text-center font-medium text-slate-600">
                {item}
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
          {/* STEP 1: Type & Basic Info */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold">Type d'annonce</h2>
              <p className="text-slate-500 -mt-2">Quel type de logement proposez-vous ?</p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {listingTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = form.type === type.id;
                  
                  return (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => setForm({ ...form, type: type.id })}
                      className={`p-5 rounded-2xl border-2 text-left transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
                          : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`w-8 h-8 mb-3 ${
                        isSelected ? "text-emerald-600" : "text-slate-400"
                      }`} />
                      <p className={`font-semibold ${
                        isSelected ? "text-emerald-700" : "text-slate-700"
                      }`}>
                        {type.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {type.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="h-px bg-slate-100 my-4" />

              <h2 className="text-2xl font-bold mt-6">Informations générales</h2>

              <input
                name="title"
                placeholder="Titre de l'annonce *"
                value={form.title}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />

              <textarea
                rows="6"
                name="description"
                placeholder="Description détaillée *"
                value={form.description}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold">Localisation</h2>

              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Sélectionnez une ville *</option>
                {citiesList.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>

              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
                <MapPinIcon className="w-12 h-12 mx-auto text-emerald-500" />
                <p className="mt-3 text-slate-500 font-medium">
                  Carte interactive bientôt disponible
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Pour l'instant, précisez simplement la ville
                </p>
              </div>
            </>
          )}

          {/* STEP 3: Pricing & Availability */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold">Prix et disponibilité</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Prix mensuel (MAD) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    placeholder="ex: 2500"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Disponible à partir de *
                  </label>
                  <input
                    type="date"
                    name="available_from"
                    value={form.available_from}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="furnished"
                  checked={form.furnished}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-slate-700">Logement meublé</span>
              </label>
            </>
          )}

          {/* STEP 4: Photos & Amenities */}
          {step === 4 && (
            <>
              <h2 className="text-2xl font-bold">Équipements & Photos</h2>

              {/* Amenities */}
              <div>
                <p className="font-semibold text-slate-700 mb-3">
                  Équipements proposés
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {amenitiesList.map((item) => {
                    const Icon = item.icon;
                    const isSelected = form.amenities.includes(item.id);

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => toggleAmenity(item.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photos upload */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  onChange={handleUpload}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                >
                  📸 Choisir des photos
                </button>

                <p className="text-sm text-slate-500 mt-3">
                  Minimum 3 photos • Max 10 photos
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Formats acceptés : JPG, PNG (max 5MB par photo)
                </p>
              </div>

              {/* Photo previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {previews.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="h-32 w-full object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photos.length < 3 && (
                <p className="text-amber-600 text-sm flex items-center gap-2">
                  ⚠️ Encore {3 - photos.length} photo(s) requise(s)
                </p>
              )}
            </>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4 pt-6 border-t border-slate-100">
            {step > 1 && (
              <button
                type="button"
                onClick={prev}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
              >
                ← Retour
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={next}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                Continuer →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Publication en cours..." : "Publier l'annonce"}
              </button>
            )}
          </div>
        </form>

        {/* Résumé de l'annonce en cours (optionnel) */}
        {step > 1 && (
          <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <span className="font-medium">📋 Type:</span> 
              {listingTypes.find(t => t.id === form.type)?.name || "Non sélectionné"}
              <span className="mx-2">•</span>
              <span className="font-medium">📍 Ville:</span> {form.city || "Non sélectionnée"}
              <span className="mx-2">•</span>
              <span className="font-medium">💰 Prix:</span> {form.price ? `${form.price} MAD` : "Non défini"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}