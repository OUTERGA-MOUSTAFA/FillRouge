import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../src/store/authStore';
import { authService } from '../src/services/auth';
import { usersService } from '../src/services/users';
import {
  UserIcon, CameraIcon, ChevronDownIcon,
  HeartIcon, MoonIcon, SparklesIcon, FireIcon,
  UserGroupIcon, ShieldCheckIcon,
  ArrowUpTrayIcon, DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// ─── Constantes ────────────────────────────────────────────────────────────────

const VILLES = [
  'Agadir', 'Tanger', 'Fès', 'Meknès', 'Marrakech',
  'Casablanca', 'Rabat', 'Essaouira', 'Tétouan', 'Oujda'
];

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

const LANGUES = [
  { id: 'arabic',   label: 'العربية' },
  { id: 'french',   label: 'Français' },
  { id: 'english',  label: 'English' },
  { id: 'amazigh',  label: 'ⵜⴰⵎⴰⵣⵉⵖⵜ' },
];

const TRANCHES_AGE = [
  { value: '', label: 'Sélectionner' },
  { value: '18-25', label: '18 – 25 ans' },
  { value: '25-35', label: '25 – 35 ans' },
  { value: '35-50', label: '35 – 50 ans' },
  { value: '50+',   label: '50 ans et +' },
];

// ─── Composant principal ────────────────────────────────────────────────────────

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading]           = useState(false);
  const [avatar, setAvatar]             = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [identityFile, setIdentityFile]  = useState(null);
  const [initialized, setInitialized]   = useState(false);

  const [formData, setFormData] = useState({
    // Infos de base
    full_name:       '',
    phone:           '',
    gender:          '',
    birth_date:      '',
    age_range:       '',
    profession:      '',
    occupation:      '',
    city:            '',
    neighborhood:    '',
    budget_min:      '',
    budget_max:      '',
    bio:             '',
    description:     '',
    languages:       [],
    // Centres d'intérêt & mode de vie
    interests:       [],
    smoking:         '',
    pets:            '',
    sleep_schedule:  '',
    cleanliness:     '',
    social_level:    '',
    // Préférences colocataire
    preferred_gender:  '',
    preferred_min_age: '',
    preferred_max_age: '',
    accepts_pets:      '',
    accepts_smokers:   '',
  });

  // ── Chargement des données utilisateur ────────────────────────────────────────
  const chargerDonnees = useCallback(() => {
    if (user && !initialized) {
      setFormData({
        full_name:       user.full_name || '',
        phone:           user.phone || '',
        gender:          user.gender || '',
        birth_date:      user.birth_date ? user.birth_date.split('T')[0] : '',
        age_range:       user.age_range || '',
        profession:      user.profession || '',
        occupation:      user.profile?.occupation || '',
        city:            user.profile?.city || '',
        neighborhood:    user.profile?.neighborhood || '',
        budget_min:      user.budget_min || '',
        budget_max:      user.budget_max || '',
        bio:             user.profile?.bio || '',
        description:     user.profile?.description || '',
        languages:       user.profile?.languages || [],
        interests:       user.profile?.interests || [],
        smoking:         user.profile?.smoking || '',
        pets:            user.profile?.pets || '',
        sleep_schedule:  user.profile?.sleep_schedule || '',
        cleanliness:     user.profile?.cleanliness || '',
        social_level:    user.profile?.social_level || '',
        preferred_gender:  user.profile?.preferred_gender || '',
        preferred_min_age: user.profile?.preferred_min_age || '',
        preferred_max_age: user.profile?.preferred_max_age || '',
        accepts_pets:      user.profile?.accepts_pets ?? '',
        accepts_smokers:   user.profile?.accepts_smokers ?? '',
      });
      if (user.avatar) setAvatarPreview(user.avatar);
      setInitialized(true);
    }
  }, [user, initialized]);

  useEffect(() => { chargerDonnees(); }, [chargerDonnees]);

  // ── Handlers génériques ───────────────────────────────────────────────────────
  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleInterest = (id) =>
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id],
    }));

  const toggleLanguage = (id) =>
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(id)
        ? prev.languages.filter(l => l !== id)
        : [...prev.languages, id],
    }));

  const setField = (name, value) =>
    setFormData(prev => ({ ...prev, [name]: value }));

  // ── Upload avatar ─────────────────────────────────────────────────────────────
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

  // ── Upload pièce d'identité ───────────────────────────────────────────────────
  const handleIdentity = (e) => {
    const file = e.target.files[0];
    if (file) setIdentityFile(file);
  };

  // ── Soumission ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Mise à jour des infos de base
      await authService.updateProfile({
        full_name:  formData.full_name,
        phone:      formData.phone,
        gender:     formData.gender,
        birth_date: formData.birth_date,
        profession: formData.profession,
        budget_min: formData.budget_min,
        budget_max: formData.budget_max,
      });

      // Upload avatar si modifié
      if (avatar) await authService.uploadAvatar(avatar);

      // Mise à jour des détails du profil
      await usersService.updateProfileDetails({
        bio:             formData.bio,
        description:     formData.description,
        city:            formData.city,
        neighborhood:    formData.neighborhood,
        occupation:      formData.occupation,
        interests:       formData.interests,
        smoking:         formData.smoking,
        pets:            formData.pets,
        sleep_schedule:  formData.sleep_schedule,
        cleanliness:     formData.cleanliness,
        social_level:    formData.social_level,
        preferred_gender:  formData.preferred_gender,
        preferred_min_age: formData.preferred_min_age || null,
        preferred_max_age: formData.preferred_max_age || null,
        accepts_pets:      formData.accepts_pets === '' ? null : formData.accepts_pets === 'yes',
        accepts_smokers:   formData.accepts_smokers === '' ? null : formData.accepts_smokers === 'yes',
      });

      toast.success('Profil mis à jour avec succès');
      navigate('/profile');
    } catch (error) {
      const msg = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Rendu
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f4f3]">

      {/* ── En-tête de page ────────────────────────────────────────────────── */}
      <div className="border-b border-gray-300 bg-[#f0f4f3] py-6 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">Compléter mon profil</h1>
          <p className="text-sm text-gray-500 mt-1">
            Aidez les autres à mieux vous connaître.
          </p>
        </div>
      </div>

      {/* ── Contenu principal ──────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* ── 1. Photo de profil ─────────────────────────────────────────── */}
        <Section>
          <div className="flex flex-col items-center gap-3">
            {/* Avatar */}
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
              {/* Bouton caméra */}
              <label className="absolute bottom-0 right-0 bg-[#00BBA7] rounded-full p-1.5 shadow-md cursor-pointer hover:bg-[#009966] transition-colors">
                <CameraIcon className="h-4 w-4 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
              </label>
            </div>
            {/* Bouton texte */}
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-1.5 border border-[#00BBA7] text-[#00BBA7] text-sm font-medium px-4 py-1.5 rounded-full hover:bg-[#e6f7f5] transition-colors">
                <ArrowUpTrayIcon className="h-3.5 w-3.5" />
                Choisir une photo
              </span>
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </label>
            <p className="text-xs text-gray-400">JPG, PNG — max 5 Mo</p>
          </div>
        </Section>

        {/* ── 2. Informations de base ────────────────────────────────────── */}
        <Section titre="Informations de base" icone={<UserIcon className="h-4 w-4" />}>
          <div className="space-y-4">

            {/* Nom complet */}
            <div>
              <Label>Nom complet <Requis /></Label>
              <Input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Ahmed Benali" />
            </div>

            {/* Âge + Genre */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Âge</Label>
                <div className="relative">
                  <input
                    type="number"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    placeholder="Âge"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <Label>Genre</Label>
                <div className="relative">
                  <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass + ' appearance-none'}>
                    <option value="">Préfère ne pas dire</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Tranche d'âge */}
            <div>
              <Label>Tranche d'âge</Label>
              <div className="relative">
                <select name="age_range" value={formData.age_range} onChange={handleChange} className={inputClass + ' appearance-none'}>
                  {TRANCHES_AGE.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Téléphone + Email (lecture seule) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Téléphone</Label>
                <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+212 6XX XXX XXX" />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input
                  name="email"
                  value={user?.email || ''}
                  onChange={() => {}}
                  readOnly
                  className={inputClass + ' bg-gray-50 text-gray-400 cursor-not-allowed'}
                  placeholder="email@exemple.com"
                />
              </div>
            </div>

            {/* Langues préférées */}
            <div>
              <Label>Langues préférées</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {LANGUES.map(l => (
                  <ChipToggle
                    key={l.id}
                    active={formData.languages.includes(l.id)}
                    onClick={() => toggleLanguage(l.id)}
                    label={l.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── 3. À propos ────────────────────────────────────────────────── */}
        <Section titre="À propos" icone={<DocumentTextIcon className="h-4 w-4" />}>
          <div className="space-y-4">
            <div>
              <Label>Présentez-vous</Label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Parlez de vous, de vos hobbies, de votre travail ou de vos études..."
                className={inputClass + ' resize-none'}
              />
            </div>
          </div>
        </Section>

        {/* ── 4. Localisation & budget ───────────────────────────────────── */}
        <Section titre="Localisation & Budget">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Ville */}
              <div>
                <Label>Ville</Label>
                <div className="relative">
                  <select name="city" value={formData.city} onChange={handleChange} className={inputClass + ' appearance-none'}>
                    <option value="">Choisir une ville</option>
                    {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              {/* Quartier */}
              <div>
                <Label>Quartier</Label>
                <Input name="neighborhood" value={formData.neighborhood} onChange={handleChange} placeholder="Ex : Maarif, Agdal…" />
              </div>
            </div>

            {/* Budget */}
            <div>
              <Label>Budget mensuel (MAD)</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input name="budget_min" type="number" value={formData.budget_min} onChange={handleChange} placeholder="Min" />
                <Input name="budget_max" type="number" value={formData.budget_max} onChange={handleChange} placeholder="Max" />
              </div>
            </div>
          </div>
        </Section>

        {/* ── 5. Centres d'intérêt ───────────────────────────────────────── */}
        <Section titre="Centres d'intérêt & Loisirs" icone={<HeartIcon className="h-4 w-4" />}>
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

        {/* ── 6. Mode de vie ─────────────────────────────────────────────── */}
        <Section titre="Préférences de vie" icone={<SparklesIcon className="h-4 w-4" />}>
          <div className="space-y-5">

            {/* Tabac */}
            <LigneVie
              titre="Tabac"
              icone={<FireIcon className="h-4 w-4 text-gray-400" />}
            >
              <RadioGroup
                options={[
                  { value: 'no',           label: 'Non-fumeur' },
                  { value: 'occasionally', label: 'Occasionnel' },
                  { value: 'yes',          label: 'Fumeur' },
                ]}
                value={formData.smoking}
                onChange={v => setField('smoking', v)}
              />
            </LigneVie>

            {/* Animaux */}
            <LigneVie
              titre="Animaux domestiques"
              icone={<HeartIcon className="h-4 w-4 text-gray-400" />}
            >
              <RadioGroup
                options={[
                  { value: 'no',    label: 'Non' },
                  { value: 'maybe', label: 'Peut-être' },
                  { value: 'yes',   label: 'Oui' },
                ]}
                value={formData.pets}
                onChange={v => setField('pets', v)}
              />
            </LigneVie>

            {/* Horaire de sommeil */}
            <LigneVie
              titre="Horaire de sommeil"
              icone={<MoonIcon className="h-4 w-4 text-gray-400" />}
            >
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
              </div>
            </LigneVie>

            {/* Propreté */}
            <LigneVie
              titre="Niveau de propreté"
              icone={<SparklesIcon className="h-4 w-4 text-gray-400" />}
            >
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
              </div>
            </LigneVie>

            {/* Niveau social */}
            <LigneVie
              titre="Niveau social"
              icone={<UserGroupIcon className="h-4 w-4 text-gray-400" />}
            >
              <RadioGroup
                options={[
                  { value: 'introvert', label: 'Introverti' },
                  { value: 'ambivert',  label: 'Ambiverti' },
                  { value: 'extrovert', label: 'Extraverti' },
                ]}
                value={formData.social_level}
                onChange={v => setField('social_level', v)}
              />
            </LigneVie>

          </div>
        </Section>

        {/* ── 7. Préférences colocataire ─────────────────────────────────── */}
        <Section titre="Préférences colocataire" icone={<UserGroupIcon className="h-4 w-4" />}>
          <div className="space-y-5">

            {/* Genre préféré */}
            <LigneVie titre="Genre préféré" icone={<UserIcon className="h-4 w-4 text-gray-400" />}>
              <RadioGroup
                options={[
                  { value: 'male',   label: 'Homme' },
                  { value: 'female', label: 'Femme' },
                  { value: 'any',    label: 'Peu importe' },
                ]}
                value={formData.preferred_gender}
                onChange={v => setField('preferred_gender', v)}
              />
            </LigneVie>

            {/* Accepte animaux */}
            <LigneVie titre="Accepte les animaux" icone={<HeartIcon className="h-4 w-4 text-gray-400" />}>
              <RadioGroup
                options={[
                  { value: 'no',  label: 'Non' },
                  { value: 'yes', label: 'Oui' },
                ]}
                value={formData.accepts_pets}
                onChange={v => setField('accepts_pets', v)}
              />
            </LigneVie>

            {/* Accepte fumeurs */}
            <LigneVie titre="Accepte les fumeurs" icone={<FireIcon className="h-4 w-4 text-gray-400" />}>
              <RadioGroup
                options={[
                  { value: 'no',  label: 'Non' },
                  { value: 'yes', label: 'Oui' },
                ]}
                value={formData.accepts_smokers}
                onChange={v => setField('accepts_smokers', v)}
              />
            </LigneVie>

            {/* Tranche d'âge préférée */}
            <div>
              <Label>Tranche d'âge préférée</Label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="relative">
                  <Input
                    name="preferred_min_age"
                    type="number"
                    value={formData.preferred_min_age}
                    onChange={handleChange}
                    placeholder="Âge min (18)"
                  />
                </div>
                <div className="relative">
                  <Input
                    name="preferred_max_age"
                    type="number"
                    value={formData.preferred_max_age}
                    onChange={handleChange}
                    placeholder="Âge max (100)"
                  />
                </div>
              </div>
            </div>

          </div>
        </Section>

        {/* ── 8. Vérification d'identité ─────────────────────────────────── */}
        <Section titre="Vérification d'identité" icone={<ShieldCheckIcon className="h-4 w-4" />}>
          <div
            className="border-2 border-dashed border-[#b2e5df] rounded-xl bg-[#f0faf8] p-6 flex flex-col items-center gap-3 cursor-pointer hover:bg-[#e6f7f5] transition-colors"
            onClick={() => document.getElementById('identity-input').click()}
          >
            <ArrowUpTrayIcon className="h-8 w-8 text-[#00BBA7]" />
            <p className="text-sm font-medium text-[#00BBA7]">
              {identityFile ? identityFile.name : "Déposer une CIN ou un passeport"}
            </p>
            <input id="identity-input" type="file" accept="image/*,.pdf" onChange={handleIdentity} className="hidden" />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center flex items-center justify-center gap-1">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            Pour votre sécurité, votre identité sera vérifiée de façon confidentielle.
            Vos documents ne seront utilisés qu'à des fins de vérification.
          </p>
        </Section>

        {/* ── 9. Actions ─────────────────────────────────────────────────── */}
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
                Enregistrer et continuer
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-white text-gray-600 py-3.5 rounded-xl font-medium text-base border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>

          <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
            </svg>
            Vous pourrez modifier ces informations ultérieurement.
          </p>
        </div>

      </div>{/* fin contenu */}
    </div>
  );
}

// ─── Sous-composants réutilisables ─────────────────────────────────────────────

const inputClass =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-[#00BBA7]/40 focus:border-[#00BBA7] transition-colors';

/** Champ texte/number générique */
function Input({ className, ...props }) {
  return <input {...props} className={className ?? inputClass} />;
}

/** Label de champ */
function Label({ children }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}
    </label>
  );
}

/** Astérisque rouge obligatoire */
function Requis() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

/** Carte de section */
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

/** Puce sélectionnable */
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

/** Ligne de préférence de vie (titre + contenu) */
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

/** Groupe de boutons radio horizontaux */
function RadioGroup({ options, value, onChange }) {
  return (
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
  );
}

/** Ligne radio verticale (pour les listes) */
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