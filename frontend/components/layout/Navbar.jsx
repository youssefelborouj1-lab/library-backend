import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  FiBook, FiUser, FiLogOut, FiMenu, FiX,
  FiBell, FiSearch, FiHome, FiSettings
} from 'react-icons/fi';

export default function Navbar({ user, onLogout }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  async function fetchNotifications() {
    try {
      const { data } = await axios.get('/api/users/notifications');
      setNotifications(data.notifications.filter(n => !n.is_read).slice(0, 5));
    } catch {}
  }

  async function markAllRead() {
    try {
      await axios.put('/api/users/notifications');
      setNotifications([]);
      setNotifOpen(false);
    } catch {}
  }

  const unread = notifications.length;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FiBook className="text-white text-sm" />
              </div>
              <span className="font-display font-semibold text-gray-900 text-lg hidden sm:block">
                BiblioUni
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/" label="Accueil" icon={<FiHome />} active={router.pathname === '/'} />
              <NavLink href="/catalogue" label="Catalogue" icon={<FiBook />} active={router.pathname.startsWith('/catalogue')} />
              {user && (
                <NavLink href="/search" label="Recherche" icon={<FiSearch />} active={router.pathname === '/search'} />
              )}
              {user && ['admin', 'bibliothecaire'].includes(user.role) && (
                <NavLink href="/admin" label="Admin" icon={<FiSettings />} active={router.pathname.startsWith('/admin')} />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiBell className="text-lg" />
                    {unread > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                      <div className="flex items-center justify-between p-3 border-b border-gray-100">
                        <span className="font-medium text-sm text-gray-900">Notifications</span>
                        {unread > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700">
                            Tout marquer lu
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-6">Aucune notification</p>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={`p-3 border-b border-gray-50 ${!n.is_read ? 'bg-blue-50' : ''}`}>
                              <p className="text-sm font-medium text-gray-900">{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                      <Link href="/profile" className="block p-2 text-center text-xs text-primary-600 hover:text-primary-700 border-t border-gray-100">
                        Voir toutes les notifications
                      </Link>
                    </div>
                  )}
                </div>

                <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                    <FiUser className="text-primary-600 text-sm" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
                </Link>

                <button
                  onClick={onLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Déconnexion"
                >
                  <FiLogOut className="text-lg" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-secondary text-sm">Connexion</Link>
                <Link href="/auth/register" className="btn-primary text-sm">Inscription</Link>
              </div>
            )}

            <button
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 space-y-1">
            <MobileNavLink href="/" label="Accueil" onClick={() => setMenuOpen(false)} />
            <MobileNavLink href="/catalogue" label="Catalogue" onClick={() => setMenuOpen(false)} />
            {user && <MobileNavLink href="/search" label="Recherche" onClick={() => setMenuOpen(false)} />}
            {user && ['admin', 'bibliothecaire'].includes(user.role) && (
              <MobileNavLink href="/admin" label="Admin" onClick={() => setMenuOpen(false)} />
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, label, icon, active }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
    >
      {label}
    </Link>
  );
}
