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
  { id: "ac", name: "AC", icon: FireIcon },
  { id: "parking", name: "Parking", icon: BuildingStorefrontIcon },
  { id: "tv", name: "TV", icon: DevicePhoneMobileIcon },
  { id: "kitchen", name: "Kitchen", icon: HomeIcon },
  { id: "pets", name: "Pets", icon: UserIcon },
];

export default function CreateListing() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    price: "",
    property_type: "room",
    available_from: "",
    furnished: false,
    amenities: [],
  });

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     toast.error("Please login first");
  //     navigate("/CreateListing");
  //   }
  // }, []);

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
      toast.error("Max 10 photos");
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
      if (!form.title || !form.description) {
        toast.error("Complete all fields");
        return false;
      }
    }

    if (step === 2) {
      if (!form.city) {
        toast.error("Choose city");
        return false;
      }
    }

    if (step === 3) {
      if (!form.price || !form.available_from) {
        toast.error("Complete pricing info");
        return false;
      }
    }

    if (step === 4 && photos.length < 3) {
      toast.error("Minimum 3 photos");
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

    //map property_type backend expecting type
    fd.append('type', form.property_type);

    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('city', form.city);
    fd.append('available_from', form.available_from);

    // boolean '1'/'0',
    fd.append('furnished', form.furnished ? '1' : '0');

    // amenities must be array items
    form.amenities.forEach((amenity, i) => {
      fd.append(`amenities[${i}]`, amenity);
    });

    // Photos
    photos.forEach((photo, i) => {
      fd.append(`photos[${i}]`, photo);
    });

    try {
      await listingsService.create(fd);
      toast.success("Listing created");
      navigate("/MyListings");
    } catch (error) {
      // console.log('Validation errors:', error.response?.data);
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach(msg => toast.error(msg));
      } else {
        toast.error(error.response?.data?.message || "Error");
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Info", "Location", "Price", "Photos"];

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900">
            Create New Listing
          </h1>
          <p className="text-slate-500 mt-2">
            Publish your room in few steps
          </p>
        </div>

        {/* progress */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {steps.map((item, index) => (
            <div key={index}>
              <div
                className={`h-2 rounded-full ${step >= index + 1 ? "bg-emerald-500" : "bg-slate-200"
                  }`}
              />
              <p className="text-sm mt-2 text-center font-medium text-slate-600">
                {item}
              </p>
            </div>
          ))}
        </div>

        <form
          onSubmit={submit}
          className="bg-white rounded-3xl shadow-xl p-8 space-y-8"
        >
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold">Basic Info</h2>

              <div className="grid md:grid-cols-3 gap-4">
                {["room", "apartment", "house"].map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() =>
                      setForm({ ...form, property_type: type })
                    }
                    className={`p-5 rounded-2xl border text-center font-semibold capitalize ${form.property_type === type
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <input
                name="title"
                placeholder="Listing title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />

              <textarea
                rows="6"
                name="description"
                placeholder="Description..."
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              />
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold">Location</h2>

              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="">Choose City</option>
                {citiesList.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>

              <div className="bg-slate-100 rounded-2xl p-8 text-center">
                <MapPinIcon className="w-10 h-10 mx-auto text-emerald-500" />
                <p className="mt-3 text-slate-500">
                  Map integration coming soon
                </p>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold">Pricing</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={form.price}
                  onChange={handleChange}
                  className="border rounded-xl px-4 py-3"
                />

                <input
                  type="date"
                  name="available_from"
                  value={form.available_from}
                  onChange={handleChange}
                  className="border rounded-xl px-4 py-3"
                />
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="furnished"
                  checked={form.furnished}
                  onChange={handleChange}
                />
                Furnished
              </label>
            </>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <>
              <h2 className="text-2xl font-bold">Details & Photos</h2>

              <div>
                <p className="font-semibold mb-3">Amenities</p>

                <div className="grid md:grid-cols-3 gap-3">
                  {amenitiesList.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => toggleAmenity(item.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border ${form.amenities.includes(item.id)
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "border-slate-200"
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* photos */}
              <div className="border-2 border-dashed rounded-2xl p-8 text-center">
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
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl"
                >
                  Upload Photos
                </button>

                <p className="text-sm text-slate-500 mt-2">
                  Minimum 3 photos
                </p>
              </div>

              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {previews.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        className="h-28 w-full object-cover rounded-xl"
                      />

                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* buttons */}
          <div className="flex gap-4 pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={prev}
                className="flex-1 py-3 rounded-xl bg-slate-200"
              >
                Previous
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={next}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white"
              >
                {loading ? "Publishing..." : "Publish Listing"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}