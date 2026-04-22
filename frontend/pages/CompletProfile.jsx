import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../src/store/authStore';
import { usersService } from '../src/services/users';
import {
  HeartIcon, MoonIcon, SparklesIcon, FireIcon,
  UserGroupIcon, ShieldCheckIcon, ArrowUpTrayIcon,
  DocumentTextIcon, MapPinIcon, UserIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { authService } from '../src/services/auth';



const CENTRES_INTERET = [
  { id: 'cooking',     label: 'Cuisine' },
  { id: 'fitness',     label: 'Sport' },
  { id: 'tech',        label: 'Technologie' },
  { id: 'travel',      label: 'Voyage' },
  { id: 'study',       label: 'Études' },
  { id: 'remote_work', label: 'Télétravail' },
  { id: 'music',       label: 'Musique' },
  { id: 'sports',      label: 'Sports' },
  { id: 'reading',     label: 'Lecture' },
  { id: 'art',         label: 'Art' },
  { id: 'gaming',      label: 'Jeux vidéo' },
  { id: 'outdoors',    label: 'Plein air' },
];

const OCCUPATIONS = [
  { value: '',              label: 'Sélectionner' },
  { value: 'student',       label: 'Étudiant(e)' },
  { value: 'employed',      label: 'Salarié(e)' },
  { value: 'self_employed', label: 'Indépendant(e)' },
  { value: 'unemployed',    label: 'Sans emploi' },
  { value: 'retired',       label: 'Retraité(e)' },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function EditProfileDetails() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading]           = useState(false);
  const [identityFile, setIdentityFile] = useState(null);
  const [initialized, setInitialized]   = useState(false);
  const [errors, setErrors]             = useState({});

  const [formData, setFormData] = useState({
    bio:               '',
    description:       '',
    occupation:        '',
    city:              '',
    neighborhood:      '',
    interests:         [],
    smoking:           '',
    pets:              '',
    sleep_schedule:    '',
    cleanliness:       '',
    social_level:      '',
    preferred_gender:  '',
    preferred_min_age: '',
    preferred_max_age: '',
    accepts_pets:      '',
    accepts_smokers:   '',
  });

  // ── Load ─────────────────────────────────────────────────────────────────────
  const loadData = useCallback(() => {
    if (user && !initialized) {
      const p = user.profile ?? {};
      setFormData({
        bio:               p.bio               ?? '',
        description:       p.description       ?? '',
        occupation:        p.occupation        ?? '',
        city:              p.city              ?? '',
        neighborhood:      p.neighborhood      ?? '',
        interests:         p.interests         ?? [],
        smoking:           p.smoking           ?? '',
        pets:              p.pets              ?? '',
        sleep_schedule:    p.sleep_schedule    ?? '',
        cleanliness:       p.cleanliness       ?? '',
        social_level:      p.social_level      ?? '',
        preferred_gender:  p.preferred_gender  ?? '',
        preferred_min_age: p.preferred_min_age ?? '',
        preferred_max_age: p.preferred_max_age ?? '',
        // API returns boolean | null → map to 'yes'/'no'/''
        accepts_pets:     p.accepts_pets    === true ? 'yes' : p.accepts_pets    === false ? 'no' : '',
        accepts_smokers:  p.accepts_smokers === true ? 'yes' : p.accepts_smokers === false ? 'no' : '',
      });
      setInitialized(true);
    }
  }, [user, initialized]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const toggleInterest = (id) =>
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id],
    }));

  const setField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleIdentity = (e) => {
    const file = e.target.files[0];
    if (file) setIdentityFile(file);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});
    try {
      const payload = {
        bio:               formData.bio               || undefined,
        description:       formData.description       || undefined,
        occupation:        formData.occupation        || undefined,
        city:              formData.city              || undefined,
        neighborhood:      formData.neighborhood      || undefined,
        interests:         formData.interests.length  ? formData.interests : undefined,
        smoking:           formData.smoking           || undefined,
        pets:              formData.pets              || undefined,
        sleep_schedule:    formData.sleep_schedule    || undefined,
        cleanliness:       formData.cleanliness       || undefined,
        social_level:      formData.social_level      || undefined,
        preferred_gender:  formData.preferred_gender  || undefined,
        preferred_min_age: formData.preferred_min_age ? Number(formData.preferred_min_age) : undefined,
        preferred_max_age: formData.preferred_max_age ? Number(formData.preferred_max_age) : undefined,
        // Controller expects boolean | null
        accepts_pets:     formData.accepts_pets    === '' ? null : formData.accepts_pets    === 'yes',
        accepts_smokers:  formData.accepts_smokers === '' ? null : formData.accepts_smokers === 'yes',
      };

      await usersService.updateProfileDetails(payload);

      // Upload identity doc if selected
      if (identityFile) {
        await authService.uploadIdDocument(identityFile, 'cin');
      }

      toast.success('Profil détaillé mis à jour');
      navigate('/profile');
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data?.errors ?? {});
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

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-base font-semibold text-gray-900">Détails du profil</h1>
            <p className="text-xs text-gray-400">Aidez les autres à mieux vous connaître</p>
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

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* ── 1. Bio ── */}
        <Section titre="À propos" icone={<DocumentTextIcon className="h-4 w-4" />}>
          <div className="space-y-4">
            <Field label="Présentation courte" error={errors.bio?.[0]}>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                maxLength={1000}
                placeholder="Décrivez-vous en quelques mots…"
                className={textareaClass(!!errors.bio)}
              />
              <p className="text-xs text-gray-400 text-right mt-0.5">{formData.bio.length}/1000</p>
            </Field>

            <Field label="Description détaillée" error={errors.description?.[0]}>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                maxLength={2000}
                placeholder="Parlez de vos habitudes, vos attentes, votre style de vie…"
                className={textareaClass(!!errors.description)}
              />
              <p className="text-xs text-gray-400 text-right mt-0.5">{formData.description.length}/2000</p>
            </Field>

            {/* Occupation — must match enum */}
            <Field label="Situation professionnelle" error={errors.occupation?.[0]}>
              <div className="relative">
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className={selectClass(!!errors.occupation)}
                >
                  {OCCUPATIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
            </Field>
          </div>
        </Section>

        

        {/* ── 3. Centres d'intérêt ── */}
        <Section titre="Centres d'intérêt" icone={<HeartIcon className="h-4 w-4" />}>
          {errors.interests && (
            <p className="text-xs text-red-500 mb-3">{errors['interests.0']?.[0] || errors.interests?.[0]}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {CENTRES_INTERET.map(({ id, label }) => (
              <ChipToggle
                key={id}
                active={formData.interests.includes(id)}
                onClick={() => toggleInterest(id)}
                label={label}
              />
            ))}
          </div>
        </Section>

        {/* ── 4. Mode de vie ── */}
        <Section titre="Mode de vie" icone={<SparklesIcon className="h-4 w-4" />}>
          <div className="space-y-5">

            <LigneVie titre="Tabac" icone={<FireIcon className="h-4 w-4 text-gray-400" />}>
              <RadioGroup
                name="smoking"
                options={[
                  { value: 'no',           label: 'Non-fumeur' },
                  { value: 'occasionally', label: 'Occasionnel' },
                  { value: 'yes',          label: 'Fumeur' },
                ]}
                value={formData.smoking}
                onChange={v => setField('smoking', v)}
                error={errors.smoking?.[0]}
              />
            </LigneVie>

            <LigneVie titre="Animaux domestiques" icone={<HeartIcon className="h-4 w-4 text-gray-400" />}>
              <RadioGroup
                name="pets"
                options={[
                  { value: 'no',    label: 'Non' },
                  { value: 'maybe', label: 'Peut-être' },
                  { value: 'yes',   label: 'Oui' },
                ]}
                value={formData.pets}
                onChange={v => setField('pets', v)}
                error={errors.pets?.[0]}
              />
            </LigneVie>

            <LigneVie titre="Horaire de sommeil" icone={<MoonIcon className="h-4 w-4 text-gray-400" />}>
              <div className="space-y-2">
                {[
                  { value: 'early_bird', label: 'Lève-tôt' },
                  { value: 'flexible',   label: 'Normal / Flexible' },
                  { value: 'night_owl',  label: 'Couche-tard' },
                ].map(opt => (
                  <RadioLine
                    key={opt.value}
                    label={opt.label}
                    active={formData.sleep_schedule === opt.value}
                    onClick={() => setField('sleep_schedule', opt.value)}
                  />
                ))}
                {errors.sleep_schedule && <p className="text-xs text-red-500">{errors.sleep_schedule[0]}</p>}
              </div>
            </LigneVie>

            <LigneVie titre="Niveau de propreté" icone={<SparklesIcon className="h-4 w-4 text-gray-400" />}>
              <div className="space-y-2">
                {[
                  { value: 'relaxed',    label: 'Relax' },
                  { value: 'moderate',   label: 'Modéré' },
                  { value: 'very_clean', label: 'Très propre' },
                ].map(opt => (
                  <RadioLine
                    key={opt.value}
                    label={opt.label}
                    active={formData.cleanliness === opt.value}
                    onClick={() => setField('cleanliness', opt.value)}
                  />
                ))}
                {errors.cleanliness && <p className="text-xs text-red-500">{errors.cleanliness[0]}</p>}
              </div>
            </LigneVie>

            <LigneVie titre="Niveau social" icone={<UserGroupIcon className="h-4 w-4 text-gray-400" />}>
              <RadioGroup
                name="social_level"
                options={[
                  { value: 'introvert', label: 'Introverti' },
                  { value: 'ambivert',  label: 'Ambiverti' },
                  { value: 'extrovert', label: 'Extraverti' },
                ]}
                value={formData.social_level}
                onChange={v => setField('social_level', v)}
                error={errors.social_level?.[0]}
              />
            </LigneVie>

          </div>
        </Section>

        {/* ── 5. Préférences colocataire ── */}
        <Section titre="Préférences colocataire" icone={<UserGroupIcon className="h-4 w-4" />}>
          <div className="space-y-5">

            <LigneVie titre="Genre préféré" icone={<UserIcon className="h-4 w-4 text-gray-400" />}>
              <RadioGroup
                name="preferred_gender"
                options={[
                  { value: 'male',   label: 'Homme' },
                  { value: 'female', label: 'Femme' },
                  { value: 'any',    label: 'Peu importe' },
                ]}
                value={formData.preferred_gender}
                onChange={v => setField('preferred_gender', v)}
                error={errors.preferred_gender?.[0]}
              />
            </LigneVie>

            <LigneVie titre="Accepte les animaux" icone={<HeartIcon className="h-4 w-4 text-gray-400" />}>
              <RadioGroup
                name="accepts_pets"
                options={[
                  { value: 'no',  label: 'Non' },
                  { value: 'yes', label: 'Oui' },
                ]}
                value={formData.accepts_pets}
                onChange={v => setField('accepts_pets', v)}
                error={errors.accepts_pets?.[0]}
              />
            </LigneVie>

            <LigneVie titre="Accepte les fumeurs" icone={<FireIcon className="h-4 w-4 text-gray-400" />}>
              <RadioGroup
                name="accepts_smokers"
                options={[
                  { value: 'no',  label: 'Non' },
                  { value: 'yes', label: 'Oui' },
                ]}
                value={formData.accepts_smokers}
                onChange={v => setField('accepts_smokers', v)}
                error={errors.accepts_smokers?.[0]}
              />
            </LigneVie>

            {/* Age range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tranche d'âge préférée
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Field error={errors.preferred_min_age?.[0]}>
                  <input
                    type="number"
                    name="preferred_min_age"
                    value={formData.preferred_min_age}
                    onChange={handleChange}
                    min={18} max={100}
                    placeholder="Âge min (18)"
                    className={inputClass(!!errors.preferred_min_age)}
                  />
                </Field>
                <Field error={errors.preferred_max_age?.[0]}>
                  <input
                    type="number"
                    name="preferred_max_age"
                    value={formData.preferred_max_age}
                    onChange={handleChange}
                    min={18} max={100}
                    placeholder="Âge max (100)"
                    className={inputClass(!!errors.preferred_max_age)}
                  />
                </Field>
              </div>
            </div>

          </div>
        </Section>

        {/* ── 6. Vérification d'identité ── */}
        <Section titre="Vérification d'identité" icone={<ShieldCheckIcon className="h-4 w-4" />}>
          <div
            className="border-2 border-dashed border-[#b2e5df] rounded-xl bg-[#f0faf8] p-6 flex flex-col items-center gap-3 cursor-pointer hover:bg-[#e6f7f5] transition-colors"
            onClick={() => document.getElementById('identity-input').click()}
          >
            <ArrowUpTrayIcon className="h-8 w-8 text-[#00BBA7]" />
            <p className="text-sm font-medium text-[#00BBA7]">
              {identityFile ? identityFile.name : 'Déposer une CIN ou un passeport'}
            </p>
            <input
              id="identity-input"
              type="file"
              accept="image/*,.pdf"
              onChange={handleIdentity}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center flex items-center justify-center gap-1">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            Vos documents ne seront utilisés qu'à des fins de vérification confidentielle.
          </p>
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
                Enregistrer les détails
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

// ─── Style helpers ────────────────────────────────────────────────────────────

const base =
  'w-full px-4 py-2.5 border rounded-xl text-sm bg-white transition-colors ' +
  'focus:outline-none focus:ring-2 focus:ring-[#00BBA7]/40 focus:border-[#00BBA7] ';

const inputClass    = (err = false) => base + (err ? 'border-red-400 bg-red-50' : 'border-gray-200');
const selectClass   = (err = false) => inputClass(err) + ' appearance-none';
const textareaClass = (err = false) => base + 'resize-none ' + (err ? 'border-red-400 bg-red-50' : 'border-gray-200');

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChevronIcon() {
  return (
    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
      fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function Section({ titre, icone, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {titre && (
        <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-gray-50">
          {icone && <span className="text-[#00BBA7]">{icone}</span>}
          <h2 className="font-semibold text-gray-900 text-base">{titre}</h2>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function ChipToggle({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
        active
          ? 'bg-[#e6f7f5] text-[#009966] border-[#00BBA7]'
          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );
}

function LigneVie({ titre, icone, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {icone}
        <span className="text-sm font-medium text-gray-700">{titre}</span>
      </div>
      {children}
    </div>
  );
}

function RadioGroup({ options, value, onChange, error }) {
  return (
    <div>
      <div className="flex gap-2 flex-wrap">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 min-w-[80px] px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
              value === opt.value
                ? 'bg-[#009966] text-white border-[#009966] shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function RadioLine({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
        active
          ? 'bg-[#e6f7f5] border-[#00BBA7] text-[#009966]'
          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
      }`}
    >
      <span>{label}</span>
      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
        active ? 'border-[#009966]' : 'border-gray-300'
      }`}>
        {active && <span className="h-2 w-2 rounded-full bg-[#009966]" />}
      </span>
    </button>
  );
}