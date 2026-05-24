import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatCard from '../../components/ui/StatCard';
import {
  FiBook, FiUsers, FiRepeat, FiAlertTriangle, FiBookmark,
  FiLayers, FiArrowRight, FiClock
} from 'react-icons/fi';

export default function AdminDashboard({ user }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!['admin', 'bibliothecaire'].includes(user?.role)) { router.push('/'); return; }
    fetchStats();
  }, [user]);

  async function fetchStats() {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/stats');
      setData(data);
    } catch {}
    setLoading(false);
  }

  if (!user || !['admin', 'bibliothecaire'].includes(user?.role)) return null;
  if (loading) return <LoadingSpinner text="Chargement du tableau de bord..." />;
  if (!data) return null;

  const { stats, popularBooks, overdueList, recentBorrows, categoryStats } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de la bibliothèque</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Livres" value={stats.total_books} icon={FiBook} color="primary" />
        <StatCard label="Utilisateurs" value={stats.total_users} icon={FiUsers} color="blue" />
        <StatCard label="Emprunts actifs" value={stats.active_borrows} icon={FiRepeat} color="green" />
        <StatCard label="En retard" value={stats.overdue_borrows} icon={FiAlertTriangle} color="red" />
        <StatCard label="Réservations" value={stats.active_reservations} icon={FiBookmark} color="yellow" />
        <StatCard label="Exemplaires dispo." value={stats.available_copies} icon={FiLayers} color="green" />
        <StatCard label="Total exemplaires" value={stats.total_copies} icon={FiLayers} color="primary" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Livres populaires</h2>
            <Link href="/admin/books" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Voir tout <FiArrowRight />
            </Link>
          </div>
          <div className="space-y-3">
            {popularBooks.map((book, i) => (
              <div key={book.id} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-gray-100 rounded-full text-xs font-bold text-gray-500 flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                {book.cover_image ? (
                  <img src={process.env.NEXT_PUBLIC_BASE_URL + book.cover_image} alt={book.title} className="w-8 h-10 object-cover rounded" />
                ) : (
                  <div className="w-8 h-10 bg-primary-50 rounded flex items-center justify-center flex-shrink-0">
                    <FiBook className="text-primary-400 text-xs" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                  <p className="text-xs text-gray-500 truncate">{book.author}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{book.borrow_count} emprunts</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FiAlertTriangle className="text-red-500" /> Retards en cours
            </h2>
            <Link href="/admin/borrows?status=overdue" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Voir tout <FiArrowRight />
            </Link>
          </div>
          {overdueList.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Aucun retard 🎉</p>
          ) : (
            <div className="space-y-3">
              {overdueList.slice(0, 5).map(borrow => (
                <div key={borrow.id} className="flex items-start gap-3 p-2 bg-red-50 rounded-lg">
                  <FiAlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{borrow.title}</p>
                    <p className="text-xs text-gray-500">{borrow.user_name} · {borrow.copy_code}</p>
                    <p className="text-xs text-red-600 font-medium mt-0.5">
                      {borrow.days_late} jour{borrow.days_late > 1 ? 's' : ''} de retard
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <FiClock /> Emprunts récents
          </h2>
          <Link href="/admin/borrows" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            Voir tout <FiArrowRight />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 font-medium text-gray-500 text-xs uppercase tracking-wide">Livre</th>
                <th className="text-left py-2 font-medium text-gray-500 text-xs uppercase tracking-wide">Utilisateur</th>
                <th className="text-left py-2 font-medium text-gray-500 text-xs uppercase tracking-wide">Date</th>
                <th className="text-left py-2 font-medium text-gray-500 text-xs uppercase tracking-wide">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentBorrows.map(b => (
                <tr key={b.id} className="table-row">
                  <td className="py-2.5 font-medium text-gray-900">{b.title.length > 30 ? b.title.slice(0, 30) + '…' : b.title}</td>
                  <td className="py-2.5 text-gray-500">{b.user_name}</td>
                  <td className="py-2.5 text-gray-500">{new Date(b.borrowed_at).toLocaleDateString('fr-FR')}</td>
                  <td className="py-2.5">
                    <BorrowStatusBadge status={b.status} due={b.due_date} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Emprunts par catégorie</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categoryStats.filter(c => c.total_borrows > 0).slice(0, 10).map(cat => (
            <div key={cat.name} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="font-bold text-lg text-primary-600">{cat.total_borrows || 0}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{cat.name}</p>
              <p className="text-xs text-gray-400">{cat.book_count} livre{cat.book_count !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BorrowStatusBadge({ status, due }) {
  const isOverdue = status === 'active' && new Date(due) < new Date();
  if (isOverdue) return <span className="badge bg-red-100 text-red-700">En retard</span>;
  const map = {
    active: 'bg-blue-100 text-blue-700',
    returned: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
  };
  const labels = { active: 'Actif', returned: 'Retourné', overdue: 'En retard' };
  return <span className={`badge ${map[status] || 'bg-gray-100 text-gray-600'}`}>{labels[status] || status}</span>;
}
