import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiGrid, FiBook, FiUsers, FiTag, FiRepeat, FiBookmark, FiBarChart2, FiLayers
} from 'react-icons/fi';

const links = [
  { href: '/admin', label: 'Tableau de bord', icon: FiGrid, exact: true },
  { href: '/admin/books', label: 'Livres', icon: FiBook },
  { href: '/admin/categories', label: 'Catégories', icon: FiTag },
  { href: '/admin/copies', label: 'Exemplaires', icon: FiLayers },
  { href: '/admin/borrows', label: 'Emprunts', icon: FiRepeat },
  { href: '/admin/reservations', label: 'Réservations', icon: FiBookmark },
  { href: '/admin/users', label: 'Utilisateurs', icon: FiUsers },
];

export default function AdminSidebar() {
  const router = useRouter();

  return (
    <aside className="w-56 bg-white border-r border-gray-200 min-h-screen flex-shrink-0">
      <div className="p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Administration</p>
        <nav className="space-y-0.5">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? router.pathname === href : router.pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`text-base flex-shrink-0 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
