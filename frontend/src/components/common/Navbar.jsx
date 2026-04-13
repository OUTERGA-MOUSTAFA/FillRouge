import { Fragment, useState, useEffect } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { 
  Bars3Icon, XMarkIcon, UserCircleIcon, 
  HomeIcon, DocumentTextIcon, ChatBubbleLeftRightIcon,
  HeartIcon, CreditCardIcon, ShieldCheckIcon,
  UsersIcon, FlagIcon, CurrencyDollarIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';

// Navigation items selon le rôle
const getNavItems = (user) => {
  const commonItems = [
    { name: 'Accueil', href: '/', icon: HomeIcon },
    { name: 'Annonces', href: '/listings', icon: DocumentTextIcon },
  ];
  
  if (!user) {
    return commonItems;
  }
  
  const userItems = [
    ...commonItems,
    { name: 'Matches', href: '/matches', icon: HeartIcon },
    { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon },
  ];
  
  if (user.role === 'admin') {
    return [
      ...commonItems,
      { name: 'Dashboard', href: '/admin', icon: ShieldCheckIcon },
      { name: 'Utilisateurs', href: '/admin/users', icon: UsersIcon },
      { name: 'Annonces', href: '/admin/listings', icon: DocumentTextIcon },
      { name: 'Signalements', href: '/admin/reports', icon: FlagIcon },
      { name: 'Paiements', href: '/admin/income-verifications', icon: CurrencyDollarIcon },
    ];
  }
  
  return userItems;
};

// Menu utilisateur connecté
const UserMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Menu as="div" className="relative ml-3">
      <Menu.Button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
      >
        {user?.avatar ? (
          <img className="h-8 w-8 rounded-full object-cover" src={user.avatar} alt="" />
        ) : (
          <UserCircleIcon className="h-8 w-8 text-gray-400" />
        )}
        <span className="text-sm font-medium text-gray-700 hidden md:inline">{user?.full_name?.split(' ')[0]}</span>
        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        {user?.is_premium && (
          <span className="hidden md:inline-block px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
            Premium
          </span>
        )}
      </Menu.Button>
      
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/profile"
                className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
              >
                👤 Mon profil
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/my-listings"
                className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
              >
                📋 Mes annonces
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/subscription/plans"
                className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
              >
                💎 Abonnement
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/notifications"
                className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
              >
                🔔 Notifications
              </Link>
            )}
          </Menu.Item>
          <hr className="my-1" />
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onLogout}
                className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-red-600`}
              >
                🚪 Déconnexion
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

// Menu visiteur
const GuestMenu = () => (
  <div className="flex items-center space-x-3">
    <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
      Connexion
    </Link>
    <Link to="/register" className="btn-primary text-sm py-2">
      Inscription
    </Link>
  </div>
);

// Sélecteur de langue
const LanguageSelector = () => {
  const [currentLang, setCurrentLang] = useState('FR');
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'FR', name: 'Français', flag: '🇫🇷' },
    { code: 'EN', name: 'English', flag: '🇬🇧' },
    { code: 'AR', name: 'العربية', flag: '🇲🇦' },
  ];
  
  const handleLanguageChange = (lang) => {
    setCurrentLang(lang.code);
    setIsOpen(false);
    // Ici vous pouvez implémenter le changement de langue
    toast.success(`Langue changée en ${lang.name}`);
  };
  
  return (
    <Menu as="div" className="relative">
      <Menu.Button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <span>{languages.find(l => l.code === currentLang)?.flag}</span>
        <span>{currentLang}</span>
        <ChevronDownIcon className="h-3 w-3" />
      </Menu.Button>
      
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
          {languages.map((lang) => (
            <Menu.Item key={lang.code}>
              {({ active }) => (
                <button
                  onClick={() => handleLanguageChange(lang)}
                  className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center gap-2`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.code}</span>
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

// Badge admin dans la navbar
const AdminBadge = () => (
  <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
    <ShieldCheckIcon className="h-3 w-3" />
    Admin
  </div>
);

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Déconnecté avec succès');
    navigate('/');
  };

  const navItems = getNavItems(user);
  const isAdmin = user?.role === 'admin';

  return (
    <Disclosure as="nav" className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm shadow-sm'}`}>
      {({ open }) => (
        <>
          <div className="container-custom">
            <div className="flex justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2 group">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                    <span className="text-white font-bold text-lg">D</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 hidden sm:inline">
                    Darna
                  </span>
                  {isAdmin && <AdminBadge />}
                </Link>
                
                {/* Desktop Navigation */}
                <div className="hidden md:ml-6 md:flex md:space-x-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.href || 
                                   (item.href !== '/' && location.pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
              
              {/* Right section */}
              <div className="flex items-center space-x-2">
                {/* Language Selector */}
                <LanguageSelector />
                
                {/* Post Listing Button */}
                {user && !isAdmin && (
                  <Link
                    to="/listings/create"
                    className="hidden md:flex items-center gap-1 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                  >
                    <DocumentTextIcon className="h-4 w-4" />
                    Publier
                  </Link>
                )}
                
                {/* Notification Bell */}
                {user && <NotificationBell />}
                
                {/* User Menu / Guest Menu */}
                {user ? (
                  <UserMenu user={user} onLogout={handleLogout} />
                ) : (
                  <GuestMenu />
                )}
                
                {/* Mobile menu button */}
                <div className="flex md:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                    {open ? <XMarkIcon className="block h-6 w-6" /> : <Bars3Icon className="block h-6 w-6" />}
                  </Disclosure.Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Panel */}
          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 pb-3 pt-2 px-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
              
              {user && !isAdmin && (
                <Link
                  to="/listings/create"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-primary-600 hover:bg-primary-50"
                >
                  <DocumentTextIcon className="h-5 w-5" />
                  Publier une annonce
                </Link>
              )}
              
              <hr className="my-2" />
              
              {!user && (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-center rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-center rounded-lg text-base font-medium bg-primary-500 text-white hover:bg-primary-600"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}