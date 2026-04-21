import { Fragment, useState, useEffect } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon, XMarkIcon,
  HomeIcon, DocumentTextIcon, ChatBubbleLeftRightIcon,
  HeartIcon, ShieldCheckIcon, UsersIcon, FlagIcon,
  CurrencyDollarIcon, ChevronDownIcon, PlusIcon,
  BookmarkIcon, PhotoIcon,
} from '@heroicons/react/24/outline';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';

// ─── Nav items per role ───────────────────────────────────────────────────────

const getNavItems = (user) => {
  const base = [
    { name: 'Accueil',   href: '/',        icon: HomeIcon },
    { name: 'Annonces',  href: '/listings', icon: DocumentTextIcon },
  ];

  if (!user) return base;

  if (user.role === 'admin') return [
    ...base,
    { name: 'Dashboard',      href: '/admin',                        icon: ShieldCheckIcon },
    { name: 'Utilisateurs',   href: '/admin/users',                  icon: UsersIcon },
    { name: 'Signalements',   href: '/admin/reports',                icon: FlagIcon },
    { name: 'Vérifications',  href: '/admin/income-verifications',   icon: CurrencyDollarIcon },
    { name: 'Sliders',        href: '/admin/sliders',                icon: PhotoIcon },
  ];

  if (user.role === 'semsar') return [
    ...base,
    { name: 'Mes annonces', href: '/MyListings', icon: DocumentTextIcon },
    { name: 'Messages',     href: '/messages',    icon: ChatBubbleLeftRightIcon },
  ];

  if (user.role === 'chercheur') return [
    ...base,
    { name: 'Matches',   href: '/matches',   icon: HeartIcon },
    { name: 'Messages',  href: '/messages',  icon: ChatBubbleLeftRightIcon },
    { name: 'Favoris',   href: '/favorites', icon: BookmarkIcon },
  ];

  return base;
};

// ─── User menu items per role ─────────────────────────────────────────────────

const getUserMenuItems = (role) => {
  const common = [
    { href: '/profile',       emoji: '👤', label: 'Mon profil' },
    { href: '/notifications', emoji: '🔔', label: 'Notifications' },
  ];

  if (role === 'semsar') return [
    ...common,
    { href: '/myLlistings',        emoji: '📋', label: 'Mes annonces' },
    { href: '/subscription/plans', emoji: '💎', label: 'Abonnement' },
  ];

  if (role === 'chercheur') return [
    ...common,
    { href: '/favorites', emoji: '❤️', label: 'Mes favoris' },
  ];

  return common; // admin + default
};

// ─── Role badge ───────────────────────────────────────────────────────────────

const ROLE_META = {
  admin:    { emoji: '👑', label: 'Administrateur', cls: 'bg-red-50 text-red-600 border-red-100' },
  semsar:   { emoji: '🏠', label: 'Propriétaire',   cls: 'bg-blue-50 text-blue-600 border-blue-100' },
  chercheur:{ emoji: '🔍', label: 'Chercheur',      cls: 'bg-purple-50 text-purple-600 border-purple-100' },
};

function RoleBadge({ role, className = '' }) {
  const meta = ROLE_META[role];
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded-full text-xs font-semibold ${meta.cls} ${className}`}>
      {meta.emoji} {meta.label}
    </span>
  );
}

// ─── Language selector ────────────────────────────────────────────────────────

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
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 transition-colors
                    ${active ? 'bg-gray-50' : ''}
                    ${current === lang.code ? 'font-semibold text-[#009966]' : ''}`}
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

// ─── User menu ────────────────────────────────────────────────────────────────

function UserMenu({ user, onLogout }) {
  const menuItems = getUserMenuItems(user?.role);

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00BBA7]/30">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.full_name}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-[#ccefeb]"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-[#ccefeb] flex items-center justify-center">
            <span className="text-[#00734d] font-bold text-sm">
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
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-50 mb-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            <RoleBadge role={user?.role} className="mt-1.5" />
          </div>

          {/* Menu items */}
          {menuItems.map(item => (
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

          {/* Logout */}
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

// ─── Guest menu ───────────────────────────────────────────────────────────────

function GuestMenu() {
  return (
    <div className="flex items-center gap-2">
      <Link
        to="/login"
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#009966] rounded-lg hover:bg-gray-50 transition-colors"
      >
        Connexion
      </Link>
      <Link
        to="/register"
        className="px-4 py-2 text-sm font-semibold text-white bg-[#009966] rounded-xl hover:bg-[#00734d] active:scale-[0.98] transition-all shadow-sm"
      >
        Inscription
      </Link>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Déconnecté avec succès');
    navigate('/');
  };

  const navItems = getNavItems(user);

  // exact match for '/', prefix match for everything else
  const isActive = (href) =>
    href === '/'
      ? location.pathname === '/'
      : location.pathname === href || location.pathname.startsWith(href + '/');

  return (
    <Disclosure
      as="nav"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-md shadow-gray-100/80'
          : 'bg-white/95 backdrop-blur-sm border-b border-gray-100'
      }`}
    >
      {/* ✅ Fix: destructure `close` to programmatically close mobile menu */}
      {({ open, close }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">

              {/* Logo + Desktop nav */}
              <div className="flex items-center gap-6">
                <Link to="/" className="flex items-center gap-2 shrink-0" onClick={close}>
                  <div className="h-8 w-8 bg-[#009966] rounded-lg flex items-center justify-center">
                    <span className="text-white font-extrabold text-base">D</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 hidden sm:block">Semsar</span>
                  {/* ✅ Use RoleBadge component, only on md+ */}
                  <span className="hidden md:block">
                    <RoleBadge role={user?.role} />
                  </span>
                </Link>

                <div className="hidden md:flex items-center gap-0.5">
                  {navItems.map(item => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-[#e6f7f5] text-[#00734d]'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right section */}
              <div className="flex items-center gap-2">
                <LanguageSelector />

                {user?.role === 'semsar' && (
                  <Link
                    to="/listings/create"
                    className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-[#009966] text-white rounded-xl text-sm font-semibold hover:bg-[#00734d] active:scale-[0.98] transition-all shadow-sm"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Publier
                  </Link>
                )}

                {user && <NotificationBell />}

                {user ? <UserMenu user={user} onLogout={handleLogout} /> : <GuestMenu />}

                <Disclosure.Button className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00BBA7]/30">
                  {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-3 space-y-1">
              {/* ✅ Fix: call close() on every Link click to dismiss menu */}
              {navItems.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={close}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#e6f7f5] text-[#00734d]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              ))}

              {user?.role === 'semsar' && (
                <Link
                  to="/listings/create"
                  onClick={close}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#009966] hover:bg-[#e6f7f5] transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  Publier une annonce
                </Link>
              )}

              <div className="border-t border-gray-100 pt-3 mt-2">
                {user ? (
                  <>
                    {/* User info header */}
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                      {user?.avatar ? (
                        <img src={user.avatar} className="h-9 w-9 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-[#ccefeb] flex items-center justify-center">
                          <span className="text-[#00734d] font-bold">{user?.full_name?.[0]}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                        <RoleBadge role={user?.role} className="mt-1" />
                      </div>
                    </div>

                    {/* ✅ Use getUserMenuItems — no duplicate logic */}
                    {getUserMenuItems(user?.role).map(item => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={close}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <span>{item.emoji}</span>
                        {item.label}
                      </Link>
                    ))}

                    <button
                      onClick={() => { close(); handleLogout(); }}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 mt-1 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <span>🚪</span> Déconnexion
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={close}
                      className="block px-3 py-2.5 text-center rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 transition-colors"
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      onClick={close}
                      className="block px-3 py-2.5 text-center rounded-xl text-sm font-semibold bg-[#009966] text-white hover:bg-[#00734d] transition-colors"
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