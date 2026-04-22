import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../src/services/auth';
import toast from 'react-hot-toast';

const INTERESTS_OPTIONS = [
  { label: 'Voyage', value: 'travel' },
  { label: 'Cuisine', value: 'cooking' },
  { label: 'Technologie', value: 'tech' },
  { label: 'Études', value: 'study' },
  { label: 'Sport', value: 'sports' },
  { label: 'Musique', value: 'music' },
  { label: 'Art', value: 'art' },
  { label: 'Lecture', value: 'reading' },
  { label: 'Jeux vidéo', value: 'gaming' },
  { label: 'Photographie', value: 'outdoors' },
];

const LANGUAGES_OPTIONS = ['English', 'Français', 'العربية'];

const AGE_RANGES = ['18-25', '26-35', '36-45', '46-55', '55+'];

const SCHEDULE_OPTIONS = [
  { label: 'Tôt le matin', value: 'early' },
  { label: 'Journée normale', value: 'normal' },
  { label: 'Tard le soir', value: 'late' },
];

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    gender: '',
    role: '',
    birth_date: '',
    age_range: '',
    interests: [],
    languages: [],
    bio: '',
    city: '',
    schedule: '',
    pets: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInterestToggle = (value) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter(i => i !== value)
        : [...prev.interests, value]
    }));
  };

  const handleLanguageToggle = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Max 5 Mo'); return; }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const validateStep1 = () => {
    if (!formData.full_name) { toast.error('Nom complet requis'); return false; }
    if (!formData.email) { toast.error('Email requis'); return false; }
    if (!formData.phone) { toast.error('Téléphone requis'); return false; }
    if (!formData.password) { toast.error('Mot de passe requis'); return false; }
    if (formData.password.length < 8) { toast.error('8 caractères minimum'); return false; }
    if (formData.password !== formData.password_confirmation) { toast.error('Les mots de passe ne correspondent pas'); return false; }
    if (!formData.role) { toast.error('Rôle requis'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        gender: formData.gender,
        birth_date: formData.birth_date,
        role: formData.role,
        interests: formData.interests,
        bio: formData.bio,
        city: formData.city,
      };

      const res = await authService.register(payload);
      if (res.token) {
        localStorage.setItem('token', res.token);
        if (avatar) await authService.uploadAvatar(avatar);
        toast.success('Compte créé avec succès');
        navigate('/onboarding');
      } else {
        toast.error('Aucun token retourné');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach(e => toast.error(e[0]));
      } else {
        toast.error(err.response?.data?.message || 'Erreur serveur');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1 ? 'Informations de base' : 'Profil & préférences'}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`h-1.5 w-20 rounded-full transition-colors ${step >= 1 ? 'bg-[#009966]' : 'bg-gray-200'}`} />
          <div className={`h-1.5 w-20 rounded-full transition-colors ${step >= 2 ? 'bg-[#009966]' : 'bg-gray-200'}`} />
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <Section icon="👤" title="Informations de base">

              {/* Avatar */}
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <label className="cursor-pointer">
                    <div className="h-20 w-20 rounded-full border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {avatarPreview
                        ? <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
                        : <span className="text-2xl">📷</span>}
                    </div>
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                  {avatarPreview && (
                    <button type="button"
                      onClick={() => { setAvatar(null); setAvatarPreview(null); }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <FieldGroup label="Nom complet">
                <Input name="full_name" placeholder="Ahmed Benali" value={formData.full_name} onChange={handleChange} />
              </FieldGroup>

              <div className="grid grid-cols-2 gap-3">
                <FieldGroup label="Genre">
                  <select name="gender" value={formData.gender} onChange={handleChange} className={selectCls}>
                    <option value="">Choisir</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Préfère ne pas dire</option>
                  </select>
                </FieldGroup>
                <FieldGroup label="Tranche d'âge">
                  <select name="age_range" value={formData.age_range} onChange={handleChange} className={selectCls}>
                    <option value="">Sélectionner</option>
                    {AGE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </FieldGroup>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FieldGroup label="Email">
                  <Input name="email" type="email" placeholder="ahmed@example.com" value={formData.email} onChange={handleChange} />
                </FieldGroup>
                <FieldGroup label="Téléphone">
                  <Input name="phone" placeholder="+212 6XX XXX XXX" value={formData.phone} onChange={handleChange} />
                </FieldGroup>
              </div>

              <FieldGroup label="Mot de passe">
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="8 caractères minimum"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </FieldGroup>

              <FieldGroup label="Confirmer le mot de passe">
                <Input name="password_confirmation" type="password" placeholder="Répétez le mot de passe"
                  value={formData.password_confirmation} onChange={handleChange} />
              </FieldGroup>

              <FieldGroup label="Rôle">
                <div className="grid grid-cols-2 gap-3">
                  {[{ value: 'chercheur', label: 'Chercheur' }, { value: 'semsar', label: 'Semsar' }].map(r => (
                    <label key={r.value}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
                        formData.role === r.value
                          ? 'border-[#009966] bg-[#009966]/5 text-[#009966]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      <input type="radio" name="role" value={r.value} onChange={handleChange} className="hidden" />
                      {r.label}
                    </label>
                  ))}
                </div>
              </FieldGroup>

              <FieldGroup label="Ville">
                <Input name="city" placeholder="Casablanca" value={formData.city} onChange={handleChange} />
              </FieldGroup>

            </Section>

            <button type="button"
              onClick={() => { if (validateStep1()) setStep(2); }}
              className="w-full bg-[#009966] text-white py-3.5 rounded-xl font-semibold text-sm">
              Suivant →
            </button>

            <p className="text-center text-sm text-gray-500">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-[#009966] font-medium">Se connecter</Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">

            <Section icon="🌐" title="Langues préférées">
              <div className="flex flex-wrap gap-2">
                {LANGUAGES_OPTIONS.map(lang => (
                  <label key={lang}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer text-sm transition-all ${
                      formData.languages.includes(lang)
                        ? 'border-[#009966] bg-[#009966]/5 text-[#009966]'
                        : 'border-gray-200 text-gray-600'
                    }`}>
                    <input type="checkbox" className="hidden"
                      checked={formData.languages.includes(lang)}
                      onChange={() => handleLanguageToggle(lang)} />
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      formData.languages.includes(lang) ? 'border-[#009966] bg-[#009966]' : 'border-gray-300'
                    }`}>
                      {formData.languages.includes(lang) && <span className="text-white text-xs">✓</span>}
                    </span>
                    {lang}
                  </label>
                ))}
              </div>
            </Section>

            <Section icon="💬" title="Présentez-vous">
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Parlez de vous, vos hobbies, votre travail ou vos études..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all placeholder:text-gray-400"
              />
            </Section>

            <Section icon="🎯" title="Centres d'intérêt">
              <div className="flex flex-wrap gap-2">
                {INTERESTS_OPTIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleInterestToggle(value)}
                    className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                      formData.interests.includes(value)
                        ? 'border-[#009966] bg-[#009966]/5 text-[#009966] font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </Section>

            <Section icon="🌿" title="Style de vie">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Rythme de vie</p>
                  <div className="space-y-2">
                    {SCHEDULE_OPTIONS.map(opt => (
                      <label key={opt.value}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 cursor-pointer text-sm transition-all ${
                          formData.schedule === opt.value
                            ? 'border-[#009966] bg-[#009966]/5'
                            : 'border-gray-200'
                        }`}>
                        <input type="radio" name="schedule" value={opt.value}
                          checked={formData.schedule === opt.value}
                          onChange={handleChange} className="hidden" />
                        <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          formData.schedule === opt.value ? 'border-[#009966]' : 'border-gray-300'
                        }`}>
                          {formData.schedule === opt.value && (
                            <span className="w-2 h-2 rounded-full bg-[#009966] block" />
                          )}
                        </span>
                        <span className="text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">Animaux de compagnie</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: 'Oui', value: true }, { label: 'Non', value: false }].map(opt => (
                      <label key={String(opt.value)}
                        className={`flex items-center justify-center py-3 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all ${
                          formData.pets === opt.value
                            ? opt.value
                              ? 'border-[#009966] bg-[#009966]/5 text-[#009966]'
                              : 'border-[#009966] bg-[#009966] text-white'
                            : 'border-gray-200 text-gray-600'
                        }`}>
                        <input type="radio" name="pets" className="hidden"
                          checked={formData.pets === opt.value}
                          onChange={() => setFormData(p => ({ ...p, pets: opt.value }))} />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 border-2 border-gray-200 text-gray-600 py-3.5 rounded-xl font-semibold text-sm">
                ← Retour
              </button>
              <button type="submit" disabled={loading}
                className="flex-[2] bg-[#009966] text-white py-3.5 rounded-xl font-semibold text-sm disabled:opacity-60">
                {loading ? 'Inscription...' : 'Créer mon compte'}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">{icon}</span>
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all placeholder:text-gray-400 ${className}`}
    />
  );
}

const selectCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all bg-white";