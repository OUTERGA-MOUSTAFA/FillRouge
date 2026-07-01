import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../src/store/authStore';
import { authService } from '../src/services/auth';
import { usersService } from '../src/services/users';
import { PhotoIcon, XMarkIcon, UserIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const interestsList = [
  'Cooking', 'Fitness', 'Tech', 'Travel', 'Study', 'Remote Work',
  'Music', 'Sports', 'Reading', 'Art', 'Gaming', 'Outdoors'
];

const languagesList = [
  { code: 'ar', name: 'العربية', flag: '🇲🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const ageRanges = [
  '18-22', '23-27', '28-32', '33-37', '38-42', '43-47', '48+'
];

export default function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [completion, setCompletion] = useState(0);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [idDocument, setIdDocument] = useState(null);
  const [idDocumentPreview, setIdDocumentPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    age_range: '',
    phone: '',
    email: '',
    preferred_languages: [],
    bio: '',
    interests: [],
    smoking: '',
    pets: '',
    sleep_schedule: '',
    cleanliness: '',
    social_level: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        gender: user.gender || '',
        age_range: user.age_range || '',
        phone: user.phone || '',
        email: user.email || '',
        preferred_languages: user.preferred_languages || [],
        bio: user.profile?.bio || '',
        interests: user.profile?.interests || [],
        smoking: user.profile?.smoking || '',
        pets: user.profile?.pets || '',
        sleep_schedule: user.profile?.sleep_schedule || '',
        cleanliness: user.profile?.cleanliness || '',
        social_level: user.profile?.social_level || '',
      });
      setCompletion(user.profile_completion || 0);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLanguageToggle = (langCode) => {
    setFormData(prev => ({
      ...prev,
      preferred_languages: prev.preferred_languages.includes(langCode)
        ? prev.preferred_languages.filter(l => l !== langCode)
        : [...prev.preferred_languages, langCode]
    }));
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleIdDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdDocument(file);
      setIdDocumentPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Mettre à jour le profil de base
      await authService.updateProfile({
        full_name: formData.full_name,
        gender: formData.gender,
        phone: formData.phone,
      });
      
      // 2. Upload de l'avatar si présent
      if (avatar) {
        await authService.uploadAvatar(avatar);
      }
      
      // 3. Upload du document d'identité si présent
      if (idDocument) {
        await authService.uploadIdDocument(idDocument, 'cin');
        toast.success(t('onboarding.toastIdSubmitted'));
      }
      
      // 4. Mettre à jour les détails du profil
      await usersService.updateProfileDetails({
        bio: formData.bio,
        interests: formData.interests,
        smoking: formData.smoking,
        pets: formData.pets,
        sleep_schedule: formData.sleep_schedule,
        cleanliness: formData.cleanliness,
        social_level: formData.social_level,
      });
      
      toast.success(t('onboarding.toastProfileCompleted'));
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || t('onboarding.errorUpdate');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = () => {
    let score = 0;
    if (formData.full_name) score += 8;
    if (formData.gender) score += 5;
    if (formData.age_range) score += 5;
    if (formData.phone) score += 5;
    if (formData.preferred_languages.length > 0) score += 5;
    if (avatar) score += 8;
    if (formData.bio && formData.bio.length > 20) score += 10;
    if (formData.interests.length >= 3) score += 10;
    if (formData.smoking) score += 6;
    if (formData.pets) score += 6;
    if (formData.sleep_schedule) score += 8;
    if (formData.cleanliness) score += 8;
    if (formData.social_level) score += 8;
    if (idDocument) score += 8;
    return Math.min(100, score);
  };

  useEffect(() => {
    setCompletion(calculateCompletion());
  }, [formData, avatar, idDocument]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f7f5] to-white py-12">
      <div className="container-custom max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#009966] px-8 py-6 text-white">
            <h1 className="text-2xl font-bold">{t('onboarding.title')}</h1>
            <p className="text-[#ccefeb] mt-1">{t('onboarding.subtitle')}</p>
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${completion}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{completion}%</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Photo Upload */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('onboarding.uploadPhoto')}
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {avatarPreview ? (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt={t('onboarding.previewAlt')}
                        className="h-24 w-24 rounded-full object-cover border-2 border-[#00BBA7]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAvatar(null);
                          setAvatarPreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <UserIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                  {t('onboarding.choosePhoto')}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500">{t('onboarding.photoHint')}</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">{t('onboarding.basicInfo')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('onboarding.fullName')} *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="input"
                    placeholder={t('onboarding.fullNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('onboarding.gender')} *
                  </label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">{t('onboarding.selectGender')}</option>
                    <option value="male">{t('onboarding.male')}</option>
                    <option value="female">{t('onboarding.female')}</option>
                    <option value="other">{t('onboarding.other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('onboarding.ageRange')} *
                  </label>
                  <select
                    name="age_range"
                    required
                    value={formData.age_range}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">{t('onboarding.selectAgeRange')}</option>
                    {ageRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('onboarding.phoneNumber')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="+212 6XX XXX XXX"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('onboarding.emailAddress')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="input pl-10 bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preferred Languages */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">{t('onboarding.preferredLanguages')}</h2>
              <div className="flex flex-wrap gap-3">
                {languagesList.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageToggle(lang.code)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      formData.preferred_languages.includes(lang.code)
                        ? 'bg-[#00BBA7] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* About You */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">{t('onboarding.aboutYou')}</h2>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="input"
                placeholder={t('onboarding.bioPlaceholder')}
              />
            </div>

            {/* Interests */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">{t('onboarding.interests')}</h2>
              <div className="flex flex-wrap gap-2">
                {interestsList.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      formData.interests.includes(interest)
                        ? 'bg-[#00BBA7] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t(`onboarding.interestLabels.${interest}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Lifestyle Preferences */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">{t('onboarding.lifestylePreferences')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sleep Schedule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('onboarding.sleepSchedule')}
                  </label>
                  <div className="flex gap-3">
                    {['early_bird', 'night_owl', 'flexible'].map(schedule => (
                      <button
                        key={schedule}
                        type="button"
                        onClick={() => setFormData({ ...formData, sleep_schedule: schedule })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.sleep_schedule === schedule
                            ? 'bg-[#00BBA7] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {schedule === 'early_bird' ? t('onboarding.earlyBird') : schedule === 'night_owl' ? t('onboarding.nightOwl') : t('onboarding.flexible')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('onboarding.havePets')}
                  </label>
                  <div className="flex gap-3">
                    {['yes', 'no', 'maybe'].map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData({ ...formData, pets: option })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.pets === option
                            ? 'bg-[#00BBA7] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option === 'yes' ? t('onboarding.yes') : option === 'no' ? t('onboarding.no') : t('onboarding.maybe')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smoking */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('onboarding.areYouSmoker')}
                  </label>
                  <div className="flex gap-3">
                    {['yes', 'no', 'occasionally'].map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData({ ...formData, smoking: option })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.smoking === option
                            ? 'bg-[#00BBA7] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option === 'yes' ? t('onboarding.yes') : option === 'no' ? t('onboarding.no') : t('onboarding.occasionally')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cleanliness */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('onboarding.cleanlinessLevel')}
                  </label>
                  <div className="flex gap-2">
                    {['relaxed', 'moderate', 'very_clean'].map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({ ...formData, cleanliness: level })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.cleanliness === level
                            ? 'bg-[#00BBA7] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level === 'relaxed' ? t('onboarding.relaxed') : level === 'moderate' ? t('onboarding.moderate') : t('onboarding.veryClean')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Social Level */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('onboarding.socialLevel')}
                  </label>
                  <div className="flex gap-3">
                    {['introvert', 'ambivert', 'extrovert'].map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({ ...formData, social_level: level })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.social_level === level
                            ? 'bg-[#00BBA7] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level === 'introvert' ? t('onboarding.introvert') : level === 'ambivert' ? t('onboarding.balanced') : t('onboarding.extrovert')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Identity Verification */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('onboarding.identityVerification')}</h2>
              <p className="text-sm text-gray-600 mb-4">
                {t('onboarding.identityVerificationDesc')}
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  id="id-document"
                  onChange={handleIdDocumentUpload}
                />
                <label
                  htmlFor="id-document"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">{t('onboarding.uploadId')}</span>
                  <span className="text-xs text-gray-400 mt-1">{t('onboarding.dragDropId')}</span>
                </label>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                {idDocumentPreview ? (
                  <>
                    <img src={idDocumentPreview} alt={t('onboarding.idPreviewAlt')} className="h-10 w-10 rounded object-cover" />
                    <span className="text-green-600">{t('onboarding.documentUploaded')}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIdDocument(null);
                        setIdDocumentPreview(null);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      {t('onboarding.remove')}
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <XMarkIcon className="h-4 w-4" />
                    <span>{t('onboarding.notVerified')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="mb-6 text-sm text-gray-500">
              {t('onboarding.changeAnytime')}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary py-3"
              >
                {loading ? t('onboarding.saving') : t('onboarding.saveContinue')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 btn-secondary py-3"
              >
                {t('onboarding.skipForNow')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}