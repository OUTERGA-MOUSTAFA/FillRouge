import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../src/store/authStore';
import { authService } from '../src/services/auth';
import { usersService } from '../src/services/users';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const interestsList = [
  'cooking', 'fitness', 'tech', 'travel', 'study', 'remote_work',
  'music', 'sports', 'reading', 'art', 'gaming', 'outdoors'
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [completion, setCompletion] = useState(0);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    phone: '',
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
        phone: user.phone || '',
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

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Mettre à jour le profil de base (endpoint updateProfile)
      await authService.updateProfile({
        full_name: formData.full_name,
        gender: formData.gender,
        phone: formData.phone,
      });
      
      // 2. Upload de l'avatar si présent (endpoint uploadAvatar)
      if (avatar) {
        await authService.uploadAvatar(avatar);
      }
      
      // 3. Mettre à jour les détails du profil (endpoint updateProfileDetails)
      await usersService.updateProfileDetails({
        bio: formData.bio,
        interests: formData.interests,
        smoking: formData.smoking,
        pets: formData.pets,
        sleep_schedule: formData.sleep_schedule,
        cleanliness: formData.cleanliness,
        social_level: formData.social_level,
      });
      
      toast.success('Profil complété avec succès !');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = () => {
    let score = 0;
    if (formData.full_name) score += 10;
    if (formData.gender) score += 10;
    if (formData.phone) score += 10;
    if (formData.bio && formData.bio.length > 20) score += 15;
    if (formData.interests.length >= 3) score += 15;
    if (formData.smoking) score += 8;
    if (formData.pets) score += 8;
    if (formData.sleep_schedule) score += 8;
    if (formData.cleanliness) score += 8;
    if (formData.social_level) score += 8;
    return Math.min(100, score);
  };

  useEffect(() => {
    setCompletion(calculateCompletion());
  }, [formData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-12">
      <div className="container-custom max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 px-8 py-6 text-white">
            <h1 className="text-2xl font-bold">Set Up Your Profile</h1>
            <p className="text-primary-100 mt-1">Tell us about yourself to find the best match.</p>
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
                Upload Photo
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {avatarPreview ? (
                    <div className="relative">
                      <img 
                        src={avatarPreview} 
                        alt="Preview" 
                        className="h-24 w-24 rounded-full object-cover border-2 border-primary-500"
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
                      <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500">Recommended: Clear face photo</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="input"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input"
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>
              </div>
            </div>

            {/* About You */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">About You</h2>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="input"
                placeholder="Tell us about yourself, your lifestyle, hobbies, and what you're looking for in a roommate..."
              />
            </div>

            {/* Interests */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {interestsList.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-3 py-1.5 rounded-full text-sm capitalize transition-colors ${
                      formData.interests.includes(interest)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {interest.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Lifestyle Preferences */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Lifestyle Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleep Schedule
                  </label>
                  <div className="flex gap-3">
                    {['early_bird', 'night_owl', 'flexible'].map(schedule => (
                      <button
                        key={schedule}
                        type="button"
                        onClick={() => setFormData({ ...formData, sleep_schedule: schedule })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.sleep_schedule === schedule
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {schedule === 'early_bird' ? 'Early Bird' : schedule === 'night_owl' ? 'Night Owl' : 'Flexible'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have pets?
                  </label>
                  <div className="flex gap-3">
                    {['yes', 'no', 'maybe'].map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData({ ...formData, pets: option })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.pets === option
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option === 'yes' ? 'Yes' : option === 'no' ? 'No' : 'Maybe'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Are you a smoker?
                  </label>
                  <div className="flex gap-3">
                    {['yes', 'no', 'occasionally'].map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData({ ...formData, smoking: option })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.smoking === option
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option === 'yes' ? 'Yes' : option === 'no' ? 'No' : 'Occasionally'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cleanliness Level
                  </label>
                  <div className="flex gap-3">
                    {['relaxed', 'very_clean'].map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({ ...formData, cleanliness: level })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.cleanliness === level
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level === 'relaxed' ? 'Relaxed' : 'Very Clean'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Level
                  </label>
                  <div className="flex gap-3">
                    {['introvert', 'extrovert'].map(level => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({ ...formData, social_level: level })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.social_level === level
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level === 'introvert' ? 'Introvert' : 'Extrovert'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Identity Verification */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Identity Verification</h2>
              <p className="text-sm text-gray-600 mb-4">
                Your identity is securely verified for safety and trust.
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  id="id-document"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        await authService.uploadIdDocument(file, 'cin');
                        toast.success('Document soumis pour vérification');
                      } catch (error) {
                        toast.error('Erreur lors de l\'upload');
                      }
                    }
                  }}
                />
                <label
                  htmlFor="id-document"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Upload National ID or Passport</span>
                  <span className="text-xs text-gray-400 mt-1">Drag and drop your ID or browse</span>
                </label>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                <XMarkIcon className="h-4 w-4" />
                <span>Not Verified</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary py-3"
              >
                {loading ? 'Saving...' : 'Save & Continue'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 btn-secondary py-3"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}