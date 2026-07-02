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
import { useTranslation } from "react-i18next";
import MapComponent from "../src/components/map/MapComponent";

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
  { id: "wifi", icon: WifiIcon },
  { id: "ac", icon: FireIcon },
  { id: "parking", icon: BuildingStorefrontIcon },
  { id: "tv", icon: DevicePhoneMobileIcon },
  { id: "kitchen", icon: HomeIcon },
  { id: "pets", icon: UserIcon },
  { id: "washing_machine", icon: CpuChipIcon },
];

// Types d'annonces disponibles
const listingTypes = [
  { id: "room", icon: HomeIcon },
  { id: "apartment", icon: BuildingOffice2Icon },
  { id: "looking_for_roommate", icon: HomeModernIcon },
];

export default function CreateListing() {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
    latitude: null,
    longitude: null,
  });

  // Clic sur la carte → enregistre les coordonnées de l'annonce
  const handleLocationSelect = (lat, lng) => {
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

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
      toast.error(t("listingForm.create.toastMaxPhotos"));
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
        toast.error(t("listingForm.create.toastTypeRequired"));
        return false;
      }
      if (!form.title || !form.title.trim()) {
        toast.error(t("listingForm.create.toastTitleRequired"));
        return false;
      }
      if (!form.description || !form.description.trim()) {
        toast.error(t("listingForm.create.toastDescriptionRequired"));
        return false;
      }
    }

    if (step === 2) {
      if (!form.city) {
        toast.error(t("listingForm.create.toastCityRequired"));
        return false;
      }
    }

    if (step === 3) {
      if (!form.price || form.price <= 0) {
        toast.error(t("listingForm.create.toastPriceRequired"));
        return false;
      }
      if (!form.available_from) {
        toast.error(t("listingForm.create.toastDateRequired"));
        return false;
      }
    }

    if (step === 4 && photos.length < 3) {
      toast.error(t("listingForm.create.toastMinPhotos"));
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

    // Coordonnées choisies sur la carte (optionnelles)
    if (form.latitude != null && form.longitude != null) {
      fd.append('latitude', form.latitude);
      fd.append('longitude', form.longitude);
    }

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
      toast.success(t("listingForm.create.toastSuccess"));
      navigate("/MyListings");
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach(msg => toast.error(msg));
      } else {
        toast.error(error.response?.data?.message || t("listingForm.create.toastCreateError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    t("listingForm.create.steps.typeInfo"),
    t("listingForm.create.steps.location"),
    t("listingForm.create.steps.priceAvailability"),
    t("listingForm.create.steps.photosDetails"),
  ];

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
            {t("listingForm.create.title")}
          </h1>
          <p className="text-slate-500 mt-2">
            {t("listingForm.create.subtitle")}
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
              <h2 className="text-2xl font-bold">{t("listingForm.create.typeHeading")}</h2>
              <p className="text-slate-500 -mt-2">{t("listingForm.create.typeQuestion")}</p>

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
                        {t(`listingForm.types.${type.id}.name`)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {t(`listingForm.types.${type.id}.description`)}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="h-px bg-slate-100 my-4" />

              <h2 className="text-2xl font-bold mt-6">{t("listingForm.create.generalInfo")}</h2>

              <input
                name="title"
                placeholder={t("listingForm.create.titlePlaceholder")}
                value={form.title}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />

              <textarea
                rows="6"
                name="description"
                placeholder={t("listingForm.create.descriptionPlaceholder")}
                value={form.description}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold">{t("listingForm.create.locationHeading")}</h2>

              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">{t("listingForm.create.selectCityRequired")}</option>
                {citiesList.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>

              <div>
                <p className="text-sm text-slate-500 mb-2 flex items-center gap-1.5">
                  <MapPinIcon className="w-4 h-4 text-emerald-500" />
                  {t("listingForm.create.mapPickHint")}
                </p>
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <MapComponent
                    onLocationSelect={handleLocationSelect}
                    selectedPosition={form.latitude != null ? [form.latitude, form.longitude] : null}
                    center={form.latitude != null ? [form.latitude, form.longitude] : undefined}
                    zoom={form.latitude != null ? 14 : 6}
                    height="340px"
                    showSearch={true}
                    showUserLocation={true}
                  />
                </div>
                {form.latitude != null ? (
                  <p className="mt-2 text-sm text-emerald-600 font-medium flex items-center gap-1.5">
                    <MapPinIcon className="w-4 h-4" />
                    {t("listingForm.create.locationSelected", {
                      lat: Number(form.latitude).toFixed(5),
                      lng: Number(form.longitude).toFixed(5),
                    })}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">
                    {t("listingForm.create.noLocationYet")}
                  </p>
                )}
              </div>
            </>
          )}

          {/* STEP 3: Pricing & Availability */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold">{t("listingForm.create.priceAvailabilityHeading")}</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("listingForm.create.monthlyPriceLabel")}
                  </label>
                  <input
                    type="number"
                    name="price"
                    placeholder={t("listingForm.create.pricePlaceholder")}
                    value={form.price}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t("listingForm.create.availableFromLabel")}
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
                <span className="text-slate-700">{t("listingForm.create.furnishedCheckbox")}</span>
              </label>
            </>
          )}

          {/* STEP 4: Photos & Amenities */}
          {step === 4 && (
            <>
              <h2 className="text-2xl font-bold">{t("listingForm.create.amenitiesPhotosHeading")}</h2>

              {/* Amenities */}
              <div>
                <p className="font-semibold text-slate-700 mb-3">
                  {t("listingForm.create.amenitiesOffered")}
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
                        <span className="text-sm font-medium">{t(`listingForm.amenities.${item.id}`)}</span>
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
                  📸 {t("listingForm.create.choosePhotos")}
                </button>

                <p className="text-sm text-slate-500 mt-3">
                  {t("listingForm.create.photosHint")}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {t("listingForm.create.photosFormats")}
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
                  ⚠️ {t("listingForm.create.photosRemaining", { count: 3 - photos.length })}
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
                ← {t("listingForm.create.back")}
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={next}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                {t("listingForm.create.continue")} →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t("listingForm.create.publishing") : t("listingForm.create.publish")}
              </button>
            )}
          </div>
        </form>

        {/* Résumé de l'annonce en cours (optionnel) */}
        {step > 1 && (
          <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <span className="font-medium">📋 {t("listingForm.create.summaryType")}</span>{" "}
              {listingTypes.some(lt => lt.id === form.type) ? t(`listingForm.types.${form.type}.name`) : t("listingForm.create.notSelectedM")}
              <span className="mx-2">•</span>
              <span className="font-medium">📍 {t("listingForm.create.summaryCity")}</span> {form.city || t("listingForm.create.notSelectedF")}
              <span className="mx-2">•</span>
              <span className="font-medium">💰 {t("listingForm.create.summaryPrice")}</span> {form.price ? t("listingForm.create.priceValue", { price: form.price }) : t("listingForm.create.priceNotDefined")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}