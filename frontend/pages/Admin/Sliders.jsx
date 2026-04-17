import { useState, useEffect } from 'react';
import {
    PlusIcon, PencilIcon, TrashIcon,
    EyeIcon, EyeSlashIcon, ArrowUpIcon,
    ArrowDownIcon, PhotoIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import { slidersService } from '../../src/services/sliders';
import toast from 'react-hot-toast';

export default function AdminSliders() {
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSlider, setEditingSlider] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        image: null,
        button_text: 'Découvrir',
        button_link: '/listings',
        order: 0,
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchSliders();
    }, []);

    const fetchSliders = async () => {
        setLoading(true);
        try {
            const response = await slidersService.getAll();
            // MAINTENANT: response est directement le tableau car on a retourné response.data.data
            setSliders(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Erreur détaillée:', error);

            // Afficher l'erreur complète pour debug
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Data:', error.response.data);

                if (error.response.status === 401) {
                    toast.error('Non authentifié - Veuillez vous reconnecter');
                } else if (error.response.status === 403) {
                    toast.error('Accès non autorisé - Vous n\'êtes pas administrateur');
                } else if (error.response.status === 404) {
                    toast.error('Route API non trouvée');
                } else {
                    toast.error(error.response.data?.message || 'Erreur chargement des sliders');
                }
            } else if (error.request) {
                toast.error('Impossible de contacter le serveur');
            } else {
                toast.error('Erreur: ' + error.message);
            }

            setSliders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (slider = null) => {
        if (slider) {
            setEditingSlider(slider);
            setFormData({
                title: slider.title || '',
                subtitle: slider.subtitle || '',
                image: null,
                button_text: slider.button_text || 'Découvrir',
                button_link: slider.button_link || '/listings',
                order: slider.order || 0,
            });
            setImagePreview(slider.image);
        } else {
            setEditingSlider(null);
            setFormData({
                title: '',
                subtitle: '',
                image: null,
                button_text: 'Découvrir',
                button_link: '/listings',
                order: sliders.length,
            });
            setImagePreview(null);
        }
        setModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('L\'image ne doit pas dépasser 2 Mo');
                return;
            }
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) {
            toast.error('Le titre est requis');
            return;
        }
        if (!editingSlider && !formData.image) {
            toast.error('Une image est requise');
            return;
        }

        try {
            if (editingSlider) {
                await slidersService.update(editingSlider.id, formData);
                toast.success('Slider mis à jour');
            } else {
                await slidersService.create(formData);
                toast.success('Slider créé');
            }
            setModalOpen(false);
            fetchSliders();
        } catch (error) {
            console.error('Erreur:', error);
            toast.error(error.response?.data?.message || error.message || 'Erreur');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer ce slider définitivement ?')) return;
        try {
            await slidersService.delete(id);
            toast.success('Slider supprimé');
            fetchSliders();
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await slidersService.toggleStatus(id, !currentStatus);
            toast.success(currentStatus ? 'Slider désactivé' : 'Slider activé');
            fetchSliders();
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const handleReorder = async (id, direction) => {
        const index = sliders.findIndex(s => s.id === id);
        const newOrder = [...sliders];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= sliders.length) return;

        [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];

        for (let i = 0; i < newOrder.length; i++) {
            if (newOrder[i].order !== i) {
                await slidersService.update(newOrder[i].id, { order: i });
            }
        }

        fetchSliders();
    };

    // Afficher le chargement
    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Sliders</h1>
                    <p className="text-gray-500 mt-1">Gérez les images du carrousel de la page d'accueil</p>
                </div>
                {/* Bouton Ajouter toujours visible */}
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#009966] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#00734d] transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    Ajouter un slider
                </button>
            </div>

            {/* Liste des sliders - affichée seulement s'il y a des sliders */}
            {sliders.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sous-titre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sliders.map((slider, index) => (
                                <tr key={slider.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">{slider.order || index}</span>
                                            <div className="flex flex-col">
                                                <button
                                                    onClick={() => handleReorder(slider.id, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                >
                                                    <ArrowUpIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleReorder(slider.id, 'down')}
                                                    disabled={index === sliders.length - 1}
                                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                                >
                                                    <ArrowDownIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <img
                                            src={slider.image}
                                            alt={slider.title}
                                            className="h-12 w-20 object-cover rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{slider.title}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500 max-w-xs truncate">{slider.subtitle || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${slider.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {slider.is_active ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(slider.id, slider.is_active)}
                                                className="text-gray-500 hover:text-gray-700"
                                                title={slider.is_active ? 'Désactiver' : 'Activer'}
                                            >
                                                {slider.is_active ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(slider)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(slider.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                // Message quand aucun slider n'existe
                <div className="bg-white rounded-xl shadow-sm text-center py-12">
                    <PhotoIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun slider pour le moment</p>
                    <p className="text-gray-400 text-sm mt-1">Cliquez sur "Ajouter un slider" pour commencer</p>
                </div>
            )}

            {/* Modal d'ajout/édition */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingSlider ? 'Modifier le slider' : 'Ajouter un slider'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sous-titre</label>
                                <textarea
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    rows="2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image *</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    {imagePreview ? (
                                        <div className="relative inline-block">
                                            <img src={imagePreview} alt="Preview" className="h-32 w-full object-cover rounded-lg" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, image: null });
                                                    setImagePreview(null);
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer inline-flex flex-col items-center">
                                            <PhotoIcon className="h-10 w-10 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-600">Cliquez pour uploader une image</span>
                                            <span className="text-xs text-gray-400">JPG, PNG, WebP - Max 2MB</span>
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Texte du bouton</label>
                                <input
                                    type="text"
                                    value={formData.button_text}
                                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lien du bouton</label>
                                <input
                                    type="text"
                                    value={formData.button_link}
                                    onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 bg-[#009966] text-white py-2 rounded-lg hover:bg-[#00734d]">
                                    {editingSlider ? 'Mettre à jour' : 'Créer'}
                                </button>
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}