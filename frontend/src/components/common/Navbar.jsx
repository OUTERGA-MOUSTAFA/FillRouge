import { Fragment, useState, useEffect } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon, XMarkIcon, UserCircleIcon,
  HomeIcon, DocumentTextIcon, ChatBubbleLeftRightIcon,
  HeartIcon, ShieldCheckIcon, UsersIcon, FlagIcon,
  CurrencyDollarIcon, ChevronDownIcon, PlusIcon,
} from '@heroicons/react/24/outline';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';

// ─── Navigation selon le rôle ──────────────────────────────────────────────────

const getNavItems = (user) => {
  const base = [
    { name: 'Accueil',   href: '/',         icon: HomeIcon },
    { name: 'Annonces',  href: '/listings', icon: DocumentTextIcon },
  ];

  if (!user) return base;

  if (user.role === 'admin') {
    return [
      ...base,
      { name: 'Dashboard',    href: '/admin',                       icon: ShieldCheckIcon },
      { name: 'Utilisateurs', href: '/admin/users',                 icon: UsersIcon },
      { name: 'Signalements', href: '/admin/reports',               icon: FlagIcon },
      { name: 'Paiements',    href: '/admin/income-verifications',  icon: CurrencyDollarIcon },
    ];
  }

  return [
    ...base,
    { name: 'Matches',   href: '/matches',  icon: HeartIcon },
    { name: 'Messages',  href: '/messages', icon: ChatBubbleLeftRightIcon },
  ];
};

// ─── Menu utilisateur connecté ─────────────────────────────────────────────────

function UserMenu({ user, onLogout }) {
  return (
    <Menu as="div" className="relative">
      {/* Déclencheur */}
      <Menu.Button className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.full_name}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-primary-100"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-bold text-sm">
              {user?.full_name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
        )}
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {user?.full_name?.split(' ')[0]}
        </span>
        <ChevronDownIcon className="h-3.5 w-3.5 text-gray-400 hidden md:block" />
        {user?.is_premium && (
          <span className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            ✦ Premium
          </span>
        )}
      </Menu.Button>

      {/* Dropdown */}
      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 translate-y-1 scale-95"
        enterTo="opacity-100 translate-y-0 scale-100"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 translate-y-0 scale-100"
        leaveTo="opacity-0 translate-y-1 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-gray-100 focus:outline-none overflow-hidden py-1.5">
          {/* Infos utilisateur */}
          <div className="px-4 py-3 border-b border-gray-50 mb-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>

          {[
            { href: '/profile',            emoji: '👤', label: 'Mon profil' },
            { href: '/my-listings',        emoji: '📋', label: 'Mes annonces' },
            { href: '/subscription/plans', emoji: '💎', label: 'Abonnement' },
            { href: '/notifications',      emoji: '🔔', label: 'Notifications' },
          ].map(item => (
            <Menu.Item key={item.href}>
              {({ active }) => (
                <Link
                  to={item.href}
                  className={`flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 transition-colors ${active ? 'bg-gray-50' : ''}`}
                >
                  <span>{item.emoji}</span>
                  {item.label}
                </Link>
              )}
            </Menu.Item>
          ))}

          <div className="border-t border-gray-50 mt-1 pt-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onLogout}
                  className={`flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-500 transition-colors ${active ? 'bg-red-50' : ''}`}
                >
                  <span>🚪</span> Déconnexion
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

// ─── Menu visiteur ─────────────────────────────────────────────────────────────

function GuestMenu() {
  return (
    <div className="flex items-center gap-2">
      <Link
        to="/login"
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Connexion
      </Link>
      <Link
        to="/register"
        className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 active:scale-[0.98] transition-all shadow-sm"
      >
        Inscription
      </Link>
    </div>
  );
}

// ─── Sélecteur de langue ───────────────────────────────────────────────────────

const LANGUES = [
  { code: 'FR', flag: '🇫🇷', name: 'Français' },
  { code: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'AR', flag: '🇲🇦', name: 'العربية' },
];

function LanguageSelector() {
  const [current, setCurrent] = useState('FR');

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none">
        <span>{LANGUES.find(l => l.code === current)?.flag}</span>
        <span className="hidden sm:inline">{current}</span>
        <ChevronDownIcon className="h-3 w-3 text-gray-400" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-gray-100 focus:outline-none py-1 overflow-hidden">
          {LANGUES.map(lang => (
            <Menu.Item key={lang.code}>
              {({ active }) => (
                <button
                  onClick={() => { setCurrent(lang.code); toast.success(`Langue : ${lang.name}`); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 transition-colors ${
                    active ? 'bg-gray-50' : ''
                  } ${current === lang.code ? 'font-semibold text-primary-600' : ''}`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.code}</span>
                  <span className="text-gray-400 text-xs">· {lang.name}</span>
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

// ─── Navbar principale ─────────────────────────────────────────────────────────

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate          = useNavigate();
  const location          = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Déconnecté avec succès');
    navigate('/');
  };

  const navItems = getNavItems(user);
  const isAdmin  = user?.role === 'admin';

  const isActive = (href) =>
    href === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(href);

  return (
    <Disclosure
      as="nav"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-md shadow-gray-100/80'
          : 'bg-white/95 backdrop-blur-sm border-b border-gray-100'
      }`}
    >
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">

              {/* ── Logo + Nav desktop ───────────────────────────────── */}
              <div className="flex items-center gap-6">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 shrink-0">
                  <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-extrabold text-base">D</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 hidden sm:block">Darna</span>
                  {/* Badge admin */}
                  {isAdmin && (
                    <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-semibold">
                      <ShieldCheckIcon className="h-3 w-3" /> Admin
                    </span>
                  )}
                </Link>

                {/* Nav desktop */}
                <div className="hidden md:flex items-center gap-0.5">
                  {navItems.map(item => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-900 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── Section droite ──────────────────────────────────── */}
              <div className="flex items-center gap-2">
                {/* Sélecteur langue */}
                <LanguageSelector />

                {/* Bouton publier (utilisateur non-admin) */}
                {user && user.role == "semsar" && (
                  <Link
                    to="/listings/create"
                    className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-[#009966] text-white rounded-xl text-sm font-semibold hover:bg-[#00734d] active:scale-[0.98] transition-all shadow-sm"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Publier
                  </Link>
                )}

                {/* Cloche de notifications */}
                {user && <NotificationBell />}

                {/* Menu utilisateur ou visiteur */}
                {user ? <UserMenu user={user} onLogout={handleLogout} /> : <GuestMenu />}

                {/* Bouton menu mobile */}
                <Disclosure.Button className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                  {open
                    ? <XMarkIcon className="h-5 w-5" />
                    : <Bars3Icon className="h-5 w-5" />
                  }
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* ── Menu mobile ─────────────────────────────────────────── */}
          <Disclosure.Panel className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              ))}

              {user && !isAdmin && (
                <Link
                  to="/listings/create"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#009966] hover:bg-[#e6f7f5] transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  Publier une annonce
                </Link>
              )}

              <div className="border-t border-gray-100 pt-3 mt-2">
                {user ? (
                  <>
                    {/* Infos utilisateur mobile */}
                    <div className="flex items-center gap-3 px-3 py-2 mb-1">
                      {user?.avatar ? (
                        <img src={user.avatar} className="h-9 w-9 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-700 font-bold">{user?.full_name?.[0]}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                      </div>
                    </div>

                    {[
                      { href: '/profile',            label: 'Mon profil' },
                      { href: '/subscription/plans', label: 'Abonnement' },
                      { href: '/notifications',      label: 'Notifications' },
                    ].map(item => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 mt-1 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      className="block px-3 py-2.5 text-center rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 transition-colors"
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2.5 text-center rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    >
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}