import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { FiBookmark, FiSearch, FiX } from 'react-icons/fi';

const STATUS_LABELS = { pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée', expired: 'Expirée' };
const STATUS_COLORS = { pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-green-100 text-green-700', cancelled: 'bg-gray-100 text-gray-500', expired: 'bg-red-100 text-red-600' };

export default function AdminReservations({ user }) {
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!['admin', 'bibliothecaire'].includes(user?.role)) { router.push('/'); return; }
    fetchReservations();
  }, [user]);

  async function fetchReservations() {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/reservations');
      setReservations(data.reservations);
    } catch {}
    setLoading(false);
  }

  async function handleCancel(id) {
    if (!confirm('Annuler cette réservation ?')) return;
    try {
      await axios.delete(`/api/reservations/${id}`);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  }

  const filtered = reservations.filter(r => {
    const matchStatus = !filterStatus || r.status === filterStatus;
    const matchSearch = !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.user_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (!user || !['admin', 'bibliothecaire'].includes(user?.role)) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Réservations</h1>
          <p className="text-sm text-gray-500 mt-0.5">{reservations.length} réservation{reservations.length !== 1 ? 's' : ''} au total</p>
        </div>
      </div>

      <div className="card p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input-field pl-9" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field sm:w-44">
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmées</option>
          <option value="cancelled">Annulées</option>
          <option value="expired">Expirées</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FiBookmark} title="Aucune réservation" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Livre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase hidden md:table-cell">Utilisateur</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase hidden sm:table-cell">Réservé le</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase hidden lg:table-cell">Expire le</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(r => (
                  <tr key={r.id} className="table-row">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-[180px]">{r.title}</p>
                      {r.copy_code && <p className="text-xs text-gray-400 font-mono">{r.copy_code}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-gray-700">{r.user_name}</p>
                      <p className="text-xs text-gray-400">{r.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {new Date(r.reserved_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {r.expires_at ? new Date(r.expires_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {['pending', 'confirmed'].includes(r.status) && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 ml-auto"
                        >
                          <FiX /> Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
