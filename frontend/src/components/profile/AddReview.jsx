import { useState } from 'react';
import { XMarkIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { reviewsService } from '../../services/reviews';
import toast from 'react-hot-toast';

const MESSAGES = {
  1: { label: 'Très décevant', sub: 'Expérience très négative' },
  2: { label: 'Décevant',      sub: 'En dessous des attentes' },
  3: { label: 'Correct',       sub: 'Expérience correcte' },
  4: { label: 'Bien',          sub: 'Bonne expérience globale' },
  5: { label: 'Excellent !',   sub: 'Expérience exceptionnelle' },
};

export default function AddRevie({ targetUser, listings = [], onClose, onSuccess }) {
  const [rating,    setRating]    = useState(0);
  const [hovered,   setHovered]   = useState(0);
  const [comment,   setComment]   = useState('');
  const [listingId, setListingId] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);

  const active = hovered || rating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error('Veuillez choisir une note'); return; }

    setLoading(true);
    try {
      await reviewsService.create(
        targetUser.id,
        rating,
        comment.trim() || null,
        listingId || null,
      );
      setDone(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1800);
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg?.includes('déjà')) toast.error('Vous avez déjà laissé un avis pour cet utilisateur');
      else toast.error(msg || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        {/* ── header ── */}
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-100">
          {/* drag handle (mobile) */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />

          <div className="flex items-center gap-3">
            {targetUser.avatar ? (
              <img src={targetUser.avatar} alt="" className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#ccefeb]" />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-[#e6f7f5] flex items-center justify-center ring-2 ring-[#99dfd7]">
                <span className="text-lg font-bold text-[#00734d]">{targetUser.full_name?.[0]}</span>
              </div>
            )}
            <div>
              <p className="text-[11px] font-semibold text-[#009966] uppercase tracking-widest">Laisser un avis</p>
              <h2 className="text-base font-bold text-gray-900 leading-tight">{targetUser.full_name}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ── success state ── */}
        {done ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#e6f7f5] flex items-center justify-center mb-4 animate-bounce">
              <CheckCircleIcon className="w-9 h-9 text-[#00BBA7]" />
            </div>
            <p className="text-lg font-bold text-gray-900">Avis envoyé !</p>
            <p className="text-sm text-gray-400 mt-1">
              Il sera publié lorsque l'autre utilisateur vous évaluera.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

            {/* ── star picker ── */}
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Votre note</p>
              <div
                className="flex items-center justify-center gap-2"
                onMouseLeave={() => setHovered(0)}
              >
                {[1,2,3,4,5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHovered(s)}
                    className="transition-transform duration-150 hover:scale-125 focus:outline-none"
                    style={{ filter: s <= active ? 'drop-shadow(0 0 6px #00BBA7aa)' : 'none' }}
                  >
                    {s <= active
                      ? <StarIcon className="w-9 h-9 text-[#00BBA7]" />
                      : <StarOutline className="w-9 h-9 text-[#ccefeb]" />
                    }
                  </button>
                ))}
              </div>

              {/* dynamic label */}
              <div className="h-8 mt-2 flex flex-col items-center justify-center">
                {active > 0 && (
                  <>
                    <p className="text-sm font-bold text-[#00734d] leading-none">{MESSAGES[active].label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{MESSAGES[active].sub}</p>
                  </>
                )}
              </div>
            </div>

            {/* ── comment ── */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Commentaire <span className="normal-case font-normal text-gray-400">(optionnel)</span>
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                placeholder="Décrivez votre expérience avec cet utilisateur…"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#66cfc3] focus:border-[#00BBA7] transition"
              />
              <p className="text-[11px] text-gray-300 text-right mt-1">{comment.length}/1000</p>
            </div>

            {/* ── listing selector ── */}
            {listings.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                  Annonce concernée <span className="normal-case font-normal text-gray-400">(optionnel)</span>
                </label>
                <select
                  value={listingId}
                  onChange={(e) => setListingId(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#66cfc3] focus:border-[#00BBA7] transition bg-white"
                >
                  <option value="">— Aucune annonce spécifique —</option>
                  {listings.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.title} · {l.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ── mutual notice ── */}
            <div className="flex gap-2.5 bg-[#e6f7f5] rounded-2xl px-4 py-3">
              <span className="text-[#00BBA7] text-base mt-0.5 flex-shrink-0">ℹ</span>
              <p className="text-xs text-[#00734d] leading-relaxed">
                Votre avis sera visible uniquement après que <strong>{targetUser.full_name?.split(' ')[0]}</strong> vous ait évalué à son tour (accord mutuel).
              </p>
            </div>

            {/* ── submit ── */}
            <button
              type="submit"
              disabled={loading || !rating}
              className="w-full py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: rating ? 'linear-gradient(135deg, #00BBA7 0%, #4FD1C5 100%)' : '#e5e7eb',
                color: rating ? 'white' : '#9ca3af',
                boxShadow: rating ? '0 4px 20px rgba(0,187,167,0.35)' : 'none',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Envoi en cours…
                </span>
              ) : 'Publier l\'avis'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}