import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import { FiRepeat, FiPlus, FiCheckSquare, FiAlertTriangle, FiSearch } from 'react-icons/fi';

export default function AdminBorrows({ user }) {
  const router = useRouter();
  const [borrows, setBorrows] = useState([]);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(router.query.status || '');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ user_id: '', copy_id: '', due_date: '' });
  const [selectedBook, setSelectedBook] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [returningId, setReturningId] = useState(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!['admin', 'bibliothecaire'].includes(user?.role)) { router.push('/'); return; }
    fetchAll();
  }, [user]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [borrowsRes, usersRes, booksRes] = await Promise.all([
        axios.get('/api/borrows'),
        axios.get('/api/admin/users'),
        axios.get('/api/books?limit=300'),
      ]);
      setBorrows(borrowsRes.data.borrows);
      setUsers(usersRes.data.users.filter(u => u.role === 'utilisateur'));
      setBooks(booksRes.data.books);
    } catch {}
    setLoading(false);
  }

  async function fetchCopiesForBook(bookId) {
    if (!bookId) { setCopies([]); return; }
    try {
      const { data } = await axios.get(`/api/copies?book_id=${bookId}`);
      setCopies(data.copies.filter(c => c.status === 'available'));
    } catch {}
  }

  function openCreate() {
    const due = new Date();
    due.setDate(due.getDate() + 14);
    setForm({ user_id: '', copy_id: '', due_date: due.toISOString().split('T')[0] });
    setSelectedBook('');
    setCopies([]);
    setModal('create');
    setMsg(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await axios.post('/api/borrows', form);
      setMsg({ type: 'success', text: 'Emprunt créé avec succès' });
      fetchAll();
      setTimeout(() => { setModal(null); setMsg(null); }, 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Erreur' });
    }
    setSaving(false);
  }

  async function handleReturn(borrow) {
    if (!confirm(`Enregistrer le retour de "${borrow.title}" ?`)) return;
    setReturningId(borrow.id);
    try {
      const { data } = await axios.put(`/api/borrows/${borrow.id}`);
      if (data.fine > 0) {
        alert(`Retour enregistré. Amende de retard : ${data.fine.toFixed(2)} €`);
      }
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
    setReturningId(null);
  }

  const filtered = borrows.filter(b => {
    const matchStatus = !filterStatus || b.status === filterStatus || (filterStatus === 'overdue' && b.status === 'active' && new Date(b.due_date) < new Date());
    const matchSearch = !search || b.title?.toLowerCase().includes(search.toLowerCase()) || b.user_name?.toLowerCase().includes(search.toLowerCase()) || b.copy_code?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (!user || !['admin', 'bibliothecaire'].includes(user?.role)) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Emprunts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{borrows.length} emprunt{borrows.length !== 1 ? 's' : ''} au total</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus /> Nouvel emprunt
        </button>
      </div>

      <div className="card p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input-field pl-9" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field sm:w-40">
          <option value="">Tous</option>
          <option value="active">Actifs</option>
          <option value="overdue">En retard</option>
          <option value="returned">Retournés</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FiRepeat} title="Aucun emprunt" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Livre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase hidden md:table-cell">Utilisateur</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase hidden sm:table-cell">Exemplaire</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Retour prévu</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(borrow => {
                  const isOverdue = borrow.status !== 'returned' && new Date(borrow.due_date) < new Date();
                  const daysLate = isOverdue ? Math.ceil((new Date() - new Date(borrow.due_date)) / (1000 * 60 * 60 * 24)) : 0;
                  return (
                    <tr key={borrow.id} className={`table-row ${isOverdue ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 truncate max-w-[150px]">{borrow.title}</p>
                        <p className="text-xs text-gray-400">{borrow.author}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-gray-700">{borrow.user_name}</p>
                        <p className="text-xs text-gray-400">{borrow.user_email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden sm:table-cell">{borrow.copy_code}</td>
                      <td className="px-4 py-3">
                        <p className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-700'}>
                          {new Date(borrow.due_date).toLocaleDateString('fr-FR')}
                        </p>
                        {isOverdue && (
                          <p className="text-xs text-red-500 flex items-center gap-0.5">
                            <FiAlertTriangle /> {daysLate}j de retard
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <BorrowBadge status={borrow.status} isOverdue={isOverdue} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {borrow.status !== 'returned' && (
                          <button
                            onClick={() => handleReturn(borrow)}
                            disabled={returningId === borrow.id}
                            className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1 ml-auto disabled:opacity-50"
                          >
                            <FiCheckSquare />
                            {returningId === borrow.id ? 'Retour...' : 'Retour'}
                          </button>
                        )}
                        {borrow.status === 'returned' && (
                          <span className="text-xs text-gray-400">
                            {borrow.returned_at ? new Date(borrow.returned_at).toLocaleDateString('fr-FR') : ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Nouvel emprunt">
        <form onSubmit={handleSubmit} className="space-y-4">
          {msg && <Alert type={msg.type} message={msg.text} />}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur *</label>
            <select value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })} className="input-field" required>
              <option value="">Sélectionner un utilisateur</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Livre *</label>
            <select
              value={selectedBook}
              onChange={e => { setSelectedBook(e.target.value); setForm({ ...form, copy_id: '' }); fetchCopiesForBook(e.target.value); }}
              className="input-field"
              required
            >
              <option value="">Sélectionner un livre</option>
              {books.map(b => <option key={b.id} value={b.id}>{b.title} ({b.available_copies} dispo.)</option>)}
            </select>
          </div>
          {selectedBook && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exemplaire disponible *</label>
              <select value={form.copy_id} onChange={e => setForm({ ...form, copy_id: e.target.value })} className="input-field" required>
                <option value="">Sélectionner un exemplaire</option>
                {copies.map(c => <option key={c.id} value={c.id}>{c.code} {c.location ? `— ${c.location}` : ''}</option>)}
              </select>
              {copies.length === 0 && <p className="text-xs text-red-500 mt-1">Aucun exemplaire disponible pour ce livre.</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de retour prévue *</label>
            <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className="input-field" required min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(null)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement...' : 'Créer l\'emprunt'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function BorrowBadge({ status, isOverdue }) {
  if (isOverdue) return <span className="badge bg-red-100 text-red-700 flex items-center gap-1"><FiAlertTriangle className="text-xs" />Retard</span>;
  const map = { active: 'bg-blue-100 text-blue-700', returned: 'bg-green-100 text-green-700', overdue: 'bg-red-100 text-red-700' };
  const labels = { active: 'Actif', returned: 'Retourné', overdue: 'En retard' };
  return <span className={`badge ${map[status] || 'bg-gray-100 text-gray-600'}`}>{labels[status] || status}</span>;
}
