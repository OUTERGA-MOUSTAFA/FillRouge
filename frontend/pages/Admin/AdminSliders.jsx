import { useState, useEffect, useRef } from 'react';
import {
  PlusIcon, PencilIcon, TrashIcon,
  EyeIcon, EyeSlashIcon, ArrowUpIcon,
  ArrowDownIcon, PhotoIcon, XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { slidersService } from '../../src/services/sliders';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  image: null,
  button_text: 'Découvrir',
  button_link: '/listings',
  order: 0,
};

export default function AdminSliders() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id being confirmed
  const fileInputRef = useRef(null);

  useEffect(() => { fetchSliders(); }, []);

  /* ─── API helpers ─────────────────────────────────────────── */

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const response = await slidersService.getAll();
      // Backend returns { success: true, data: [...] }
      setSliders(response.data?.data ?? response.data ?? []); //if it is undefined or null pass to next ?? meanz Nullish Coalescing
    } catch {
      toast.error('Erreur chargement des sliders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Le titre est requis'); return; }
    // if (!editingSlider && !formData.image) { toast.error('Une image est requise'); return; }
    if (!editingSlider && !formData.image) {
      console.log('Blocage envoi : pas d\'image');
      toast.error('Une image est requise');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('subtitle', formData.subtitle ?? '');
      fd.append('button_text', formData.button_text ?? 'Découvrir');
      fd.append('button_link', formData.button_link ?? '/listings');
      fd.append('order', formData.order ?? 0);
      if (formData.image) fd.append('image', formData.image);
      if (editingSlider) fd.append('_method', 'PUT'); // Laravel method spoofing for multipart

      if (editingSlider) {
        await slidersService.update(editingSlider.id, fd);
        toast.success('Slider mis à jour ✓');
      } else {
        await slidersService.create(fd);
        toast.success('Slider créé ✓');
      }
      closeModal();
      fetchSliders();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await slidersService.delete(id);
      toast.success('Slider supprimé');
      setDeleteConfirm(null);
      fetchSliders();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleStatus = async (slider) => {
    try {
      await slidersService.update(slider.id, { is_active: !slider.is_active });
      toast.success(slider.is_active ? 'Slider désactivé' : 'Slider activé');
      fetchSliders();
    } catch {
      toast.error('Erreur');
    }
  };

  const handleReorder = async (id, direction) => {
    const index = sliders.findIndex(s => s.id === id);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sliders.length) return;

    const reordered = [...sliders];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setSliders(reordered); // optimistic iken khir hhhh

    try {
      await Promise.all(
        reordered.map((s, i) => s.order !== i ? slidersService.update(s.id, { order: i }) : null)
          .filter(Boolean)
      );
      fetchSliders();
    } catch {
      toast.error('Erreur lors du tri');
      fetchSliders();
    }
  };

  /* ─── Modal helpers ───────────────────────────────────────── */

  const openModal = (slider = null) => {
    if (slider) {
      setEditingSlider(slider);
      setFormData({
        title: slider.title ?? '',
        subtitle: slider.subtitle ?? '',
        image: null,
        button_text: slider.button_text ?? 'Découvrir',
        button_link: slider.button_link ?? '/listings',
        order: slider.order ?? 0,
      });
      // image_url comes from the backend's Storage::url()
      setImagePreview(slider.image_url ?? slider.image ?? null);
    } else {
      setEditingSlider(null);
      setFormData({ ...EMPTY_FORM, order: sliders.length });
      setImagePreview(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSlider(null);
    setFormData(EMPTY_FORM);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("L'image ne doit pas dépasser 2 Mo"); return; }
    setFormData(f => ({ ...f, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  /* ─── Render ──────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8  max-w-6xl bg-amber-300 mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Sliders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {sliders.length} slider{sliders.length !== 1 ? 's' : ''} · carrousel de la page d'accueil
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter un slider
        </button>
      </div>

      {/* ── Table ── */}
      {sliders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16">
          <PhotoIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucun slider pour le moment</p>
          <button
            onClick={() => openModal()}
            className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Ajouter votre premier slider
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3 w-20">Ordre</th>
                <th className="px-5 py-3">Aperçu</th>
                <th className="px-5 py-3">Titre / Sous-titre</th>
                <th className="px-5 py-3">Bouton</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sliders.map((slider, index) => (
                <tr key={slider.id} className="hover:bg-gray-50/60 transition-colors">

                  {/* Order */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-mono text-gray-400 w-5">
                        {slider.order ?? index}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => handleReorder(slider.id, 'up')}
                          disabled={index === 0}
                          className="p-0.5 rounded text-gray-300 hover:text-gray-600 disabled:opacity-20 transition"
                          title="Monter"
                        >
                          <ArrowUpIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleReorder(slider.id, 'down')}
                          disabled={index === sliders.length - 1}
                          className="p-0.5 rounded text-gray-300 hover:text-gray-600 disabled:opacity-20 transition"
                          title="Descendre"
                        >
                          <ArrowDownIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Thumbnail */}
                  <td className="px-5 py-4">
                    {slider.image_url || slider.image ? (
                      <img
                        src={slider.image_url ?? slider.image}
                        alt={slider.title}
                        className="h-14 w-24 object-cover rounded-lg border border-gray-100"
                      />
                    ) : (
                      <div className="h-14 w-24 rounded-lg bg-gray-100 flex items-center justify-center">
                        <PhotoIcon className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </td>

                  {/* Title / subtitle */}
                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-sm font-semibold text-gray-900 truncate">{slider.title}</p>
                    {slider.subtitle && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{slider.subtitle}</p>
                    )}
                  </td>

                  {/* Button info */}
                  <td className="px-5 py-4">
                    <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-medium">
                      {slider.button_text || '—'}
                    </span>
                    {slider.button_link && (
                      <p className="text-xs text-gray-400 mt-1 font-mono truncate max-w-[120px]">
                        {slider.button_link}
                      </p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${slider.is_active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-100 text-gray-500'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${slider.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {slider.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">

                      {/* Toggle active */}
                      <button
                        onClick={() => handleToggleStatus(slider)}
                        title={slider.is_active ? 'Désactiver' : 'Activer'}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                      >
                        {slider.is_active
                          ? <EyeSlashIcon className="h-4 w-4" />
                          : <EyeIcon className="h-4 w-4" />}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => openModal(slider)}
                        title="Modifier"
                        className="p-2 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>

                      {/* Delete — with inline confirmation */}
                      {deleteConfirm === slider.id ? (
                        <span className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(slider.id)}
                            className="p-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition"
                            title="Confirmer la suppression"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                            title="Annuler"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(slider.id)}
                          title="Supprimer"
                          className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingSlider ? 'Modifier le slider' : 'Ajouter un slider'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Titre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                  placeholder="Titre du slider"
                />
              </div>

              {/* Sous-titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sous-titre</label>
                <textarea
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData(f => ({ ...f, subtitle: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition resize-none"
                  placeholder="Description courte (optionnel)"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Image {!editingSlider && <span className="text-red-400">*</span>}
                  {editingSlider && <span className="text-gray-400 font-normal"> (laisser vide pour conserver)</span>}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-100">
                    <img src={imagePreview} alt="Aperçu" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setFormData(f => ({ ...f, image: null })); setImagePreview(null); }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg transition"
                    >
                      Changer
                    </button>
                  </div>
                ) : (
                  /* Image upload button (always enabled) */
                  < button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-emerald-300 hover:bg-emerald-50/20 transition"
                  >
                    <PhotoIcon className="h-9 w-9 text-gray-300" />
                    <span className="text-sm text-gray-500 font-medium">Cliquez pour uploader</span>
                    <span className="text-xs text-gray-400">JPG, PNG, WebP · max 2 Mo</span>
                  </button>
                )}
              </div>

              {/* Bouton texte + lien */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Texte du bouton</label>
                  <input
                    type="text"
                    value={formData.button_text}
                    onChange={(e) => setFormData(f => ({ ...f, button_text: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                    placeholder="Découvrir"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Lien</label>
                  <input
                    type="text"
                    value={formData.button_link}
                    onChange={(e) => setFormData(f => ({ ...f, button_link: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                    placeholder="/listings"
                  />
                </div>
              </div>

              {/* Ordre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ordre d'affichage</label>
                <input
                  type="number"
                  min={0}
                  value={formData.order}
                  onChange={(e) => setFormData(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving || (!editingSlider && !formData.image)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 ..."
                >
                  {saving ? 'Enregistrement...' : editingSlider ? 'Mettre à jour' : 'Créer le slider'}
                </button>
              </div>
            </form>
          </div>
        </div >
      )
      }
    </div >
  );
}