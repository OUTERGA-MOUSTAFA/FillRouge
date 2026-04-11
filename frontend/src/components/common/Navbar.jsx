import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Annonces', href: '/listings' },
  { name: 'Matches', href: '/matches' },
  { name: 'Messages', href: '/messages' },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Déconnecté avec succès');
    navigate('/');
  };

  return (
    <Disclosure as="nav" className="bg-white shadow-sm">
      {({ open }) => (
        <>
          <div className="container-custom">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-primary-600">Darna</span>
                  <span className="text-sm text-gray-500 hidden sm:inline">🏠 Colocation au Maroc</span>
                </Link>
                
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                {user ? (
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button className="flex items-center space-x-2 focus:outline-none">
                      {user.avatar ? (
                        <img className="h-8 w-8 rounded-full object-cover" src={user.avatar} alt="" />
                      ) : (
                        <UserCircleIcon className="h-8 w-8 text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-700">{user.full_name}</span>
                      {user.is_premium && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
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
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                            >
                              Mon profil
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/my-listings"
                              className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                            >
                              Mes annonces
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-red-600`}
                            >
                              Déconnexion
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex space-x-3">
                    <Link to="/login" className="btn-secondary">
                      Connexion
                    </Link>
                    <Link to="/register" className="btn-primary">
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                  {open ? <XMarkIcon className="block h-6 w-6" /> : <Bars3Icon className="block h-6 w-6" />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                >
                  {item.name}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/profile" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                    Mon profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                    Connexion
                  </Link>
                  <Link to="/register" className="block px-3 py-2 text-base font-medium text-primary-600 hover:bg-gray-50">
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}