import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../src/services/auth';
import toast from 'react-hot-toast';

const interestsMap = {
  Technology: 'tech',
  Design: 'art',
  Photography: 'art',
  Travel: 'travel',
  Music: 'music',
  Sports: 'sports',
  Reading: 'reading',
  Cooking: 'cooking',
  Art: 'art',
  Gaming: 'gaming'
};

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    gender: '',
    role: '',
    birth_date: '',
    interests: [],
    bio: '',
    city: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRadioChange = (e) => {
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

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Max 5MB');
        return;
      }
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validations
    if (!formData.full_name) return toast.error('Full name required');
    if (!formData.email) return toast.error('Email required');
    if (!formData.phone) return toast.error('Phone required');
    if (!formData.password) return toast.error('Password required');
    if (formData.password.length < 8) return toast.error('Min 8 chars');
    if (formData.password !== formData.password_confirmation)
      return toast.error('Passwords mismatch');
    if (!formData.role) return toast.error('Role required');

    setLoading(true);

    try {
      const payload = {
        ...formData,
        interests: formData.interests.map(i => interestsMap[i] || i)
      };

      console.log("SENDING:", payload);

      const res = await authService.register(payload);

      console.log("RESPONSE:", res);

      if (res.token) {
        localStorage.setItem('token', res.token);

        if (avatar) {
          await authService.uploadAvatar(avatar);
        }

        toast.success('Account created');
        navigate('/onboarding');
      } else {
        toast.error('No token returned');
      }

    } catch (err) {
      console.log("ERROR:", err);

      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach(e =>
          toast.error(e[0])
        );
      } else {
        toast.error(err.response?.data?.message || 'Server error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6">

        <h2 className="text-xl font-bold mb-4 text-center">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* avatar */}
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photo
            </label>

            <div className="flex items-center gap-4">

              {/* Preview */}
              <div className="relative">
                {avatarPreview ? (
                  <div className="relative">
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="h-16 w-16 rounded-full object-cover border-2 border-blue-500"
                    />

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => {
                        setAvatar(null);
                        setAvatarPreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <span className="text-gray-400 text-sm">Img</span>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm">
                Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>

            </div>
          </div>

          {/* name */}
          <input name="full_name" placeholder="Full Name"
            value={formData.full_name} onChange={handleChange}
            className="input" />

          {/* email */}
          <input name="email" placeholder="Email"
            value={formData.email} onChange={handleChange}
            className="input" />

          {/* phone */}
          <input name="phone" placeholder="Phone"
            value={formData.phone} onChange={handleChange}
            className="input" />

          {/* password */}
          <input type={showPassword ? 'text' : 'password'}
            name="password" placeholder="Password"
            value={formData.password} onChange={handleChange}
            className="input" />

          {/* confirm */}
          <input type="password"
            name="password_confirmation"
            placeholder="Confirm"
            value={formData.password_confirmation}
            onChange={handleChange}
            className="input" />

          {/* gender */}
          <div>
            <label>
              <input type="radio" name="gender" value="male"
                onChange={handleRadioChange} /> Male
            </label>
            <label>
              <input type="radio" name="gender" value="female"
                onChange={handleRadioChange} /> Female
            </label>
          </div>

          {/* role */}
          <div>
            <label>
              <input type="radio" name="role" value="chercheur"
                onChange={handleRadioChange} /> Chercheur
            </label>
            <label>
              <input type="radio" name="role" value="semsar"
                onChange={handleRadioChange} /> Semsar
            </label>
          </div>

          {/* city */}
          <input name="city" placeholder="City"
            value={formData.city} onChange={handleChange}
            className="input" />

          {/* submit */}
          <button type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg">
            {loading ? 'Loading...' : 'Register'}
          </button>

          <p className="text-center">
            <Link to="/login">Login</Link>
          </p>

        </form>
      </div>
    </div>
  );
}