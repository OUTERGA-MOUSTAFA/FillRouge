import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../src/services/auth';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
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

  const validateStep1 = () => {
    if (!formData.full_name) { toast.error(t('auth.register.fullNameRequired')); return false; }
    if (!formData.email) { toast.error(t('auth.register.emailRequired')); return false; }
    if (!formData.phone) { toast.error(t('auth.register.phoneRequired')); return false; }
    if (!formData.password) { toast.error(t('auth.register.passwordRequired')); return false; }
    if (formData.password.length < 8) { toast.error(t('auth.register.passwordMin')); return false; }
    if (formData.password !== formData.password_confirmation) { toast.error(t('auth.common.passwordsDoNotMatch')); return false; }
    if (!formData.role) { toast.error(t('auth.register.roleRequired')); return false; }
    return true;
  };


  // Exemple avec l'API gratuite "email-verifier" (https://github.com/umuterturk/email-verifier)
  async function verifierEmailReel(email) {
    const url = `https://rapid-email-verifier.fly.dev/api/validate?email=${encodeURIComponent(email)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "VALID") {
        // L'email est valide et peut être utilisé
        return { valide: true, raison: "L'email est valide et délivrable." };
      } else if (data.status === "INVALID_EMAIL") {
        return { valide: false, raison: "L'email n'existe pas ou n'est pas délivrable." };
      } else {
        return { valide: false, raison: `L'email a été rejeté pour la raison: ${data.reason}` };
      }
    } catch (error) {
      console.error("Erreur lors de la vérification:", error);
      return { valide: false, raison: "Impossible de vérifier l'email pour le moment." };
    }
  }

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
        // if (avatar) await authService.uploadAvatar(avatar);
        toast.success(t('auth.register.accountCreated'));
        navigate('/onboarding');
      } else {
        toast.error(t('auth.register.noToken'));
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach(e => toast.error(e[0]));
      } else {
        toast.error(err.response?.data?.message || t('auth.register.serverError'));
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
          <h1 className="text-2xl font-bold text-gray-900">{t('auth.common.createAccount')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1 ? t('auth.register.basicInfo') : t('auth.register.profilePreferences')}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`h-1.5 w-20 rounded-full transition-colors ${step >= 1 ? 'bg-[#009966]' : 'bg-gray-200'}`} />
          <div className={`h-1.5 w-20 rounded-full transition-colors ${step >= 2 ? 'bg-[#009966]' : 'bg-gray-200'}`} />
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <Section title={t('auth.register.basicInfo')}>
              <FieldGroup label={t('auth.common.fullName')}>
                <Input name="full_name" placeholder={t('auth.register.fullNamePlaceholder')} value={formData.full_name} onChange={handleChange} />
              </FieldGroup>

              <div className="grid grid-cols-2 gap-3">
                <FieldGroup label={t('auth.register.gender')}>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={selectCls}>
                    <option value="">{t('auth.register.choose')}</option>
                    <option value="male">{t('auth.register.male')}</option>
                    <option value="female">{t('auth.register.female')}</option>
                    <option value="other">{t('auth.register.preferNotToSay')}</option>
                  </select>
                </FieldGroup>
                <FieldGroup label={t('auth.register.ageRange')}>
                  <select name="age_range" value={formData.age_range} onChange={handleChange} className={selectCls}>
                    <option value="">{t('auth.register.select')}</option>
                    {AGE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </FieldGroup>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FieldGroup label={t('auth.common.email')}>
                  <Input name="email" type="email" placeholder={t('auth.register.emailPlaceholder')} value={formData.email} onChange={handleChange} />
                </FieldGroup>
                <FieldGroup label={t('auth.common.phone')}>
                  <Input name="phone" placeholder={t('auth.register.phonePlaceholder')} value={formData.phone} onChange={handleChange} />
                </FieldGroup>
              </div>

              <FieldGroup label={t('auth.common.password')}>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.register.passwordMin')}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </FieldGroup>

              <FieldGroup label={t('auth.common.confirmPassword')}>
                <Input name="password_confirmation" type="password" placeholder={t('auth.register.confirmPasswordPlaceholder')}
                  value={formData.password_confirmation} onChange={handleChange} />
              </FieldGroup>

              <FieldGroup label={t('auth.register.role')}>
                <div className="grid grid-cols-2 gap-3">
                  {[{ value: 'chercheur', label: t('auth.register.roleSeeker') }, { value: 'semsar', label: t('auth.register.roleSemsar') }].map(r => (
                    <label key={r.value}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${formData.role === r.value
                          ? 'border-[#009966] bg-[#009966]/5 text-[#009966]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                      <input type="radio" name="role" value={r.value} onChange={handleChange} className="hidden" />
                      {r.label}
                    </label>
                  ))}
                </div>
              </FieldGroup>

              <FieldGroup label={t('auth.common.city')}>
                <Input name="city" placeholder={t('auth.register.cityPlaceholder')} value={formData.city} onChange={handleChange} />
              </FieldGroup>

            </Section>

            <button type="button"
              onClick={() => { if (validateStep1()) setStep(2); }}
              className="w-full bg-[#009966] text-white py-3.5 rounded-xl font-semibold text-sm">
              {t('auth.register.next')} →
            </button>

            <p className="text-center text-sm text-gray-500">
              {t('auth.register.haveAccount')}{' '}
              <Link to="/login" className="text-[#009966] font-medium">{t('auth.common.login')}</Link>
            </p>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">

            <Section icon="🌐" title={t('auth.register.preferredLanguages')}>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES_OPTIONS.map(lang => (
                  <label key={lang}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer text-sm transition-all ${formData.languages.includes(lang)
                        ? 'border-[#009966] bg-[#009966]/5 text-[#009966]'
                        : 'border-gray-200 text-gray-600'
                      }`}>
                    <input type="checkbox" className="hidden"
                      checked={formData.languages.includes(lang)}
                      onChange={() => handleLanguageToggle(lang)} />
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${formData.languages.includes(lang) ? 'border-[#009966] bg-[#009966]' : 'border-gray-300'
                      }`}>
                      {formData.languages.includes(lang) && <span className="text-white text-xs">✓</span>}
                    </span>
                    {lang}
                  </label>
                ))}
              </div>
            </Section>

            <Section icon="💬" title={t('auth.register.aboutYou')}>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder={t('auth.register.bioPlaceholder')}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#009966]/30 focus:border-[#009966] transition-all placeholder:text-gray-400"
              />
            </Section>

            <Section icon="🎯" title={t('auth.register.interestsTitle')}>
              <div className="flex flex-wrap gap-2">
                {INTERESTS_OPTIONS.map(({ value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleInterestToggle(value)}
                    className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${formData.interests.includes(value)
                        ? 'border-[#009966] bg-[#009966]/5 text-[#009966] font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                    {t(`auth.register.interests.${value}`)}
                  </button>
                ))}
              </div>
            </Section>

            <Section icon="🌿" title={t('auth.register.lifestyle')}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">{t('auth.register.rhythm')}</p>
                  <div className="space-y-2">
                    {SCHEDULE_OPTIONS.map(opt => (
                      <label key={opt.value}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 cursor-pointer text-sm transition-all ${formData.schedule === opt.value
                            ? 'border-[#009966] bg-[#009966]/5'
                            : 'border-gray-200'
                          }`}>
                        <input type="radio" name="schedule" value={opt.value}
                          checked={formData.schedule === opt.value}
                          onChange={handleChange} className="hidden" />
                        <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${formData.schedule === opt.value ? 'border-[#009966]' : 'border-gray-300'
                          }`}>
                          {formData.schedule === opt.value && (
                            <span className="w-2 h-2 rounded-full bg-[#009966] block" />
                          )}
                        </span>
                        <span className="text-gray-700">{t(`auth.register.schedule.${opt.value}`)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">{t('auth.register.pets')}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: t('auth.register.yes'), value: true }, { label: t('auth.register.no'), value: false }].map(opt => (
                      <label key={String(opt.value)}
                        className={`flex items-center justify-center py-3 rounded-xl border-2 cursor-pointer text-sm font-medium transition-all ${formData.pets === opt.value
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
                ← {t('auth.register.back')}
              </button>
              <button type="submit" disabled={loading}
                className="flex-[2] bg-[#009966] text-white py-3.5 rounded-xl font-semibold text-sm disabled:opacity-60">
                {loading ? t('auth.register.creating') : t('auth.register.createMyAccount')}
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