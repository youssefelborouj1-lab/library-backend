import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import { FiLayers, FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

const STATUS_OPTIONS = ['available', 'borrowed', 'reserved', 'damaged', 'lost'];
const STATUS_LABELS = { available: 'Disponible', borrowed: 'Emprunté', reserved: 'Réservé', damaged: 'Endommagé', lost: 'Perdu' };
const STATUS_COLORS = { available: 'bg-green-100 text-green-700', borrowed: 'bg-orange-100 text-orange-700', reserved: 'bg-blue-100 text-blue-700', damaged: 'bg-red-100 text-red-700', lost: 'bg-gray-100 text-gray-500' };

export default function AdminCopies({ user }) {
  const router = useRouter();
  const [copies, setCopies] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBook, setFilterBook] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!['admin', 'bibliothecaire'].includes(user?.role)) { router.push('/'); return; }
    fetchAll();
  }, [user]);

  async function fetchAll() {
    setLoading(true);
    try {
      const bRes = await axios.get('/api/books?limit=300');
      setBooks(bRes.data.books);
      const allCopies = [];
      for (const b of bRes.data.books) {
        const cRes = await axios.get(`/api/copies?book_id=${b.id}`);
        for (const c of cRes.data.copies) allCopies.push({ ...c, book_title: b.title, book_author: b.author });
      }
      setCopies(allCopies);
    } catch {}
    setLoading(false);
  }

  function openCreate() {
    setForm({ book_id: '', code: '', location: '' });
    setModal('create');
    setMsg(null);
  }

  function openEdit(copy) {
    setForm({ id: copy.id, code: copy.code, status: copy.status, location: copy.location || '' });
    setModal('edit');
    setMsg(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      if (modal === 'create') {
        await axios.post('/api/copies', form);
      } else {
        await axios.put(`/api/copies/${form.id}`, form);
      }
      setMsg({ type: 'success', text: 'Exemplaire enregistré' });
      fetchAll();
      setTimeout(() => { setModal(null); setMsg(null); }, 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Erreur' });
    }
    setSaving(false);
  }

  async function handleDelete(copy) {
    if (!confirm(`Supprimer l'exemplaire ${copy.code} ?`)) return;
    try {
      await axios.delete(`/api/copies/${copy.id}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  }

  const filtered = copies.filter(c => {
    const matchSearch = !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.book_title?.toLowerCase().includes(search.toLowerCase());
    const matchBook = !filterBook || String(c.book_id) === filterBook;
    return matchSearch && matchBook;
  });

  if (!user || !['admin', 'bibliothecaire'].includes(user?.role)) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Exemplaires</h1>
          <p className="text-sm text-gray-500 mt-0.5">{copies.length} exemplaire{copies.length !== 1 ? 's' : ''} au total</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus /> Ajouter
        </button>
      </div>

      <div className="card p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un code ou livre..." className="input-field pl-9" />
        </div>
        <select value={filterBook} onChange={e => setFilterBook(e.target.value)} className="input-field sm:w-56">
          <option value="">Tous les livres</option>
          {books.map(b => <option key={b.id} value={b.id}>{b.title.slice(0, 40)}</option>)}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FiLayers} title="Aucun exemplaire" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Livre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase hidden sm:table-cell">Emplacement</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(copy => (
                  <tr key={copy.id} className="table-row">
                    <td className="px-4 py-3 font-mono font-medium text-gray-900">{copy.code}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-[160px]">{copy.book_title}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{copy.location || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_COLORS[copy.status] || 'bg-gray-100 text-gray-500'}`}>
                        {STATUS_LABELS[copy.status] || copy.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(copy)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleDelete(copy)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Nouvel exemplaire' : 'Modifier l\'exemplaire'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {msg && <Alert type={msg.type} message={msg.text} />}
          {modal === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Livre *</label>
              <select value={form.book_id || ''} onChange={e => setForm({ ...form, book_id: e.target.value })} className="input-field" required>
                <option value="">Sélectionner un livre</option>
                {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
            <input type="text" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} className="input-field font-mono" required placeholder="INF-001-A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement</label>
            <input type="text" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="Rayon A1" />
          </div>
          {modal === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select value={form.status || 'available'} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(null)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
