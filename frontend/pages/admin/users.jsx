import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import { FiUsers, FiEdit2, FiTrash2, FiSearch, FiUser, FiAlertTriangle } from 'react-icons/fi';

const ROLE_COLORS = { admin: 'bg-purple-100 text-purple-700', bibliothecaire: 'bg-blue-100 text-blue-700', utilisateur: 'bg-gray-100 text-gray-600' };

export default function AdminUsers({ user }) {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!['admin', 'bibliothecaire'].includes(user?.role)) { router.push('/'); return; }
    fetchUsers();
  }, [user]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/users');
      setUsers(data.users);
    } catch {}
    setLoading(false);
  }

  function openEdit(u) {
    setForm({ id: u.id, name: u.name, email: u.email, role: u.role, is_active: u.is_active, password: '' });
    setModal('edit');
    setMsg(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await axios.put(`/api/admin/users?id=${form.id}`, form);
      setMsg({ type: 'success', text: 'Utilisateur mis à jour' });
      fetchUsers();
      setTimeout(() => { setModal(null); setMsg(null); }, 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Erreur' });
    }
    setSaving(false);
  }

  async function handleDelete(u) {
    if (!confirm(`Supprimer l'utilisateur "${u.name}" ?`)) return;
    try {
      await axios.delete(`/api/admin/users?id=${u.id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!user || !['admin', 'bibliothecaire'].includes(user?.role)) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} utilisateur{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="card p-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un utilisateur..." className="input-field pl-9" />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FiUsers} title="Aucun utilisateur" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Utilisateur</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Rôle</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase hidden sm:table-cell">Emprunts actifs</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase hidden md:table-cell">Inscrit le</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
                  <tr key={u.id} className="table-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FiUser className="text-primary-600 text-sm" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-500'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={u.overdue_borrows > 0 ? 'text-red-600 font-medium flex items-center gap-1' : 'text-gray-500'}>
                        {u.overdue_borrows > 0 && <FiAlertTriangle className="text-xs" />}
                        {u.active_borrows}
                        {u.overdue_borrows > 0 && <span className="text-xs text-red-400">({u.overdue_borrows} retard)</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {user.role === 'admin' && (
                          <>
                            <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                              <FiEdit2 />
                            </button>
                            {u.id !== user.id && (
                              <button onClick={() => handleDelete(u)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <FiTrash2 />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modal === 'edit'} onClose={() => setModal(null)} title="Modifier l'utilisateur">
        <form onSubmit={handleSubmit} className="space-y-4">
          {msg && <Alert type={msg.type} message={msg.text} />}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
            <select value={form.role || 'utilisateur'} onChange={e => setForm({ ...form, role: e.target.value })} className="input-field">
              <option value="utilisateur">Utilisateur</option>
              <option value="bibliothecaire">Bibliothécaire</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe (optionnel)</label>
            <input type="password" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="Laisser vide pour conserver" minLength={form.password ? 6 : 0} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={!!form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Compte actif</label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(null)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
