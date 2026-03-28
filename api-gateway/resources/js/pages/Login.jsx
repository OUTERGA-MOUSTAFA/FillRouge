import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(formData.email, formData.password);
            navigate('/setup-profile');     // بعد الدخول → نروح لإكمال الملف
        } catch (err) {
            setError(
                err.response?.data?.message || 
                "Email ou mot de passe incorrect"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="text-5xl mb-4">🏠</div>
                    <h1 className="text-3xl font-bold text-gray-800">Content de vous revoir</h1>
                    <p className="text-gray-600 mt-2">Connectez-vous à votre compte Darna</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-4 rounded-2xl mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adresse email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-1 transition"
                            placeholder="vous@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-1 transition"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-2xl text-lg transition duration-200"
                    >
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>

                {/* Links */}
                <div className="flex justify-between items-center mt-8 text-sm">
                    <a href="/register" className="text-blue-600 hover:underline font-medium">
                        Créer un nouveau compte
                    </a>
                    <a href="#" className="text-gray-500 hover:text-gray-700">
                        Mot de passe oublié ?
                    </a>
                </div>
            </div>
        </div>
    );
}