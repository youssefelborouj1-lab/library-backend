import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import { FiTag, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function AdminCategories({ user }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (!['admin', 'bibliothecaire'].includes(user?.role)) { router.push('/'); return; }
    fetchCategories();
  }, [user]);

  async function fetchCategories() {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/categories');
      setCategories(data.categories);
    } catch {}
    setLoading(false);
  }

  function openCreate() {
    setForm({ name: '', description: '' });
    setModal('create');
    setMsg(null);
  }

  function openEdit(cat) {
    setForm({ id: cat.id, name: cat.name, description: cat.description || '' });
    setModal('edit');
    setMsg(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      if (modal === 'create') {
        await axios.post('/api/categories', form);
      } else {
        await axios.put(`/api/categories/${form.id}`, form);
      }
      setMsg({ type: 'success', text: modal === 'create' ? 'Catégorie ajoutée' : 'Catégorie mise à jour' });
      fetchCategories();
      setTimeout(() => { setModal(null); setMsg(null); }, 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Erreur' });
    }
    setSaving(false);
  }

  async function handleDelete(cat) {
    if (!confirm(`Supprimer "${cat.name}" ?`)) return;
    try {
      await axios.delete(`/api/categories/${cat.id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  }

  if (!user || !['admin', 'bibliothecaire'].includes(user?.role)) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} catégorie{categories.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus /> Ajouter
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : categories.length === 0 ? (
        <EmptyState icon={FiTag} title="Aucune catégorie" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase hidden md:table-cell">Description</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Livres</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map(cat => (
                <tr key={cat.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {cat.description ? (cat.description.length > 60 ? cat.description.slice(0, 60) + '…' : cat.description) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-gray-100 text-gray-600">{cat.book_count}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDelete(cat)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Nouvelle catégorie' : 'Modifier la catégorie'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {msg && <Alert type={msg.type} message={msg.text} />}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(null)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement...' : modal === 'create' ? 'Créer' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
