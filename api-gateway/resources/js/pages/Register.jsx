import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.password_confirmation) {
            setError("Les mots de passe ne correspondent pas");
            setLoading(false);
            return;
        }

        try {
            await registerUser(formData);
            // بعد التسجيل الناجح → نروح مباشرة لإكمال الملف
            navigate('/setup-profile');
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10">
                <div className="text-center mb-10">
                    <div className="text-5xl mb-4">🏠</div>
                    <h1 className="text-3xl font-bold text-gray-800">Bienvenue chez Darna</h1>
                    <p className="text-gray-600 mt-2">Créons votre compte pour commencer</p>
                </div>

                {error && <div className="bg-red-100 text-red-700 p-4 rounded-2xl mb-6">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Nom complet</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-600"
                            placeholder="Mohamed Alaoui"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-600"
                            placeholder="vous@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-600"
                            placeholder="Minimum 8 caractères"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
                        <input
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            required
                            className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-600"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-lg transition"
                    >
                        {loading ? 'Création en cours...' : 'Créer mon compte'}
                    </button>
                </form>

                <p className="text-center mt-8 text-gray-600">
                    Déjà un compte ? <a href="/login" className="text-blue-600 font-medium">Se connecter</a>
                </p>
            </div>
        </div>
    );
}