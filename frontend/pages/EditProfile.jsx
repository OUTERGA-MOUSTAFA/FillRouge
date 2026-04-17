import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../src/store/authStore';
import { authService } from '../src/services/auth';
import {
  UserIcon, CameraIcon, ChevronDownIcon, ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const TRANCHES_AGE = [
  { value: '',      label: 'Sélectionner' },
  { value: '18-25', label: '18 – 25 ans' },
  { value: '25-35', label: '25 – 35 ans' },
  { value: '35-50', label: '35 – 50 ans' },
  { value: '50+',   label: '50 ans et +' },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  const [loading, setLoading]             = useState(false);
  const [avatar, setAvatar]               = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [initialized, setInitialized]     = useState(false);

  const [formData, setFormData] = useState({
    full_name:  '',
    phone:      '',
    gender:     '',
    birth_date: '',
    profession: '',
    budget_min: '',
    budget_max: '',
  });

  const [errors, setErrors] = useState({});

  // ── Load user data ──────────────────────────────────────────────────────────
  const loadData = useCallback(() => {
    if (user && !initialized) {
      setFormData({
        full_name:  user.full_name  || '',
        phone:      user.phone      || '',
        gender:     user.gender     || '',
        birth_date: user.birth_date ? user.birth_date.split('T')[0] : '',
        profession: user.profession || '',
        budget_min: user.budget_min || '',
        budget_max: user.budget_max || '',
      });
      if (user.avatar) setAvatarPreview(user.avatar);
      setInitialized(true);
    }
  }, [user, initialized]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La photo ne doit pas dépasser 5 Mo');
      return;
    }
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});
    try {
      const payload = {
        full_name:  formData.full_name  || undefined,
        phone:      formData.phone      || undefined,
        gender:     formData.gender     || undefined,
        birth_date: formData.birth_date || undefined,
        profession: formData.profession || undefined,
        budget_min: formData.budget_min !== '' ? Number(formData.budget_min) : undefined,
        budget_max: formData.budget_max !== '' ? Number(formData.budget_max) : undefined,
      };

      const res = await authService.updateProfile(payload);

      if (avatar) await authService.uploadAvatar(avatar);

      // Sync store if setUser is available
      if (setUser && res?.data?.data) setUser(res.data.data);

      toast.success('Profil mis à jour avec succès');
      navigate('/profile');
    } catch (error) {
      if (error.response?.status === 422) {
        // Map Laravel validation errors
        const laravelErrors = error.response.data?.errors ?? {};
        setErrors(laravelErrors);
        toast.error('Veuillez corriger les erreurs');
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f4f3]">

      {/* Header */}
      <div className="border-b border-gray-200 bg-white py-5 px-4 sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-base font-semibold text-gray-900">Modifier mon profil</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="text-sm font-semibold text-[#009966] hover:text-[#00BBA7] disabled:opacity-40 transition-colors"
          >
            {loading ? 'Enreg…' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-5">

        {/* ── Avatar ── */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-3">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-[#e6f7f5] flex items-center justify-center border-4 border-white shadow-md">
                <UserIcon className="h-12 w-12 text-[#00BBA7]" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-[#00BBA7] rounded-full p-1.5 shadow-md cursor-pointer hover:bg-[#009966] transition-colors">
              <CameraIcon className="h-4 w-4 text-white" />
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </label>
          </div>
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-1.5 border border-[#00BBA7] text-[#00BBA7] text-sm font-medium px-4 py-1.5 rounded-full hover:bg-[#e6f7f5] transition-colors">
              <ArrowUpTrayIcon className="h-3.5 w-3.5" />
              Choisir une photo
            </span>
            <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          </label>
          <p className="text-xs text-gray-400">JPG, PNG — max 5 Mo</p>
        </div>

        {/* ── Informations de base ── */}
        <Section titre="Informations de base">
          <div className="space-y-4">

            {/* Nom complet */}
            <Field label="Nom complet" required error={errors.full_name?.[0]}>
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Ahmed Benali"
                className={inputClass(!!errors.full_name)}
              />
            </Field>

            {/* Téléphone */}
            <Field label="Téléphone" error={errors.phone?.[0]}>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+212 6XX XXX XXX"
                className={inputClass(!!errors.phone)}
              />
            </Field>

            {/* Genre + Date de naissance */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Genre" error={errors.gender?.[0]}>
                <div className="relative">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={inputClass(!!errors.gender) + ' appearance-none'}
                  >
                    <option value="">Non précisé</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </Field>

              <Field label="Date de naissance" error={errors.birth_date?.[0]}>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={inputClass(!!errors.birth_date)}
                />
              </Field>
            </div>

            {/* Profession */}
            <Field label="Profession" error={errors.profession?.[0]}>
              <input
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                placeholder="Ingénieur, Étudiant, Freelance…"
                className={inputClass(!!errors.profession)}
              />
            </Field>

          </div>
        </Section>

        {/* ── Budget ── */}
        <Section titre="Budget mensuel (MAD)">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Minimum" error={errors.budget_min?.[0]}>
              <input
                type="number"
                name="budget_min"
                value={formData.budget_min}
                onChange={handleChange}
                min={0}
                placeholder="1 500"
                className={inputClass(!!errors.budget_min)}
              />
            </Field>
            <Field label="Maximum" error={errors.budget_max?.[0]}>
              <input
                type="number"
                name="budget_max"
                value={formData.budget_max}
                onChange={handleChange}
                min={0}
                placeholder="4 000"
                className={inputClass(!!errors.budget_max)}
              />
            </Field>
          </div>
          {(errors.budget_min || errors.budget_max) && (
            <p className="text-xs text-red-500 mt-1">
              {errors.budget_max?.[0] || errors.budget_min?.[0]}
            </p>
          )}
        </Section>

        {/* ── E-mail (read-only) ── */}
        <Section titre="Compte">
          <Field label="E-mail">
            <input
              value={user?.email || ''}
              readOnly
              className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              L'adresse e-mail ne peut pas être modifiée ici.
            </p>
          </Field>
        </Section>

        {/* ── Actions ── */}
        <div className="space-y-3 pb-10">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#009966] text-white py-3.5 rounded-xl font-semibold text-base hover:bg-[#00BBA7] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Enregistrement…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Enregistrer
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-white text-gray-600 py-3.5 rounded-xl font-medium text-base border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const inputClass = (hasError = false) =>
  `w-full px-4 py-2.5 border rounded-xl text-sm bg-white transition-colors ` +
  `focus:outline-none focus:ring-2 focus:ring-[#00BBA7]/40 focus:border-[#00BBA7] ` +
  (hasError ? 'border-red-400 bg-red-50' : 'border-gray-200');

function Section({ titre, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {titre && (
        <div className="px-5 pt-5 pb-3 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900 text-base">{titre}</h2>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}