import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import { FiBook, FiPlus, FiEdit2, FiTrash2, FiSearch, FiImage } from 'react-icons/fi';

export default function AdminBooks({ user }) {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [coverFile, setCoverFile] = useState(null);
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
      const [bRes, cRes] = await Promise.all([
        axios.get('/api/books?limit=200'),
        axios.get('/api/categories'),
      ]);
      setBooks(bRes.data.books);
      setCategories(cRes.data.categories);
    } catch {}
    setLoading(false);
  }

  function openCreate() {
    setForm({ title: '', author: '', isbn: '', category_id: '', description: '', publisher: '', published_year: '', pages: '', language: 'Français' });
    setCoverFile(null);
    setModal('create');
    setMsg(null);
  }

  function openEdit(book) {
    setForm({ ...book, category_id: book.category_id || '' });
    setCoverFile(null);
    setModal('edit');
    setMsg(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
      if (coverFile) fd.append('cover_image', coverFile);

      if (modal === 'create') {
        await axios.post('/api/books', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMsg({ type: 'success', text: 'Livre ajouté avec succès' });
      } else {
        await axios.put(`/api/books/${form.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMsg({ type: 'success', text: 'Livre mis à jour avec succès' });
      }
      fetchAll();
      setTimeout(() => { setModal(null); setMsg(null); }, 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Erreur' });
    }
    setSaving(false);
  }

  async function handleDelete(book) {
    if (!confirm(`Supprimer "${book.title}" ?`)) return;
    try {
      await axios.delete(`/api/books/${book.id}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  }

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  if (!user || !['admin', 'bibliothecaire'].includes(user?.role)) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Livres</h1>
          <p className="text-sm text-gray-500 mt-0.5">{books.length} livre{books.length !== 1 ? 's' : ''} au total</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus /> Ajouter un livre
        </button>
      </div>

      <div className="card p-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher dans les livres..."
            className="input-field pl-9"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Chargement..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FiBook} title="Aucun livre" description="Commencez par ajouter des livres." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Livre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Catégorie</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Disponibles</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Emprunts</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(book => (
                  <tr key={book.id} className="table-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-10 bg-primary-50 rounded overflow-hidden flex-shrink-0">
                          {book.cover_image ? (
                            <img src={process.env.NEXT_PUBLIC_BASE_URL + book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiBook className="text-primary-400 text-xs" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[180px]">{book.title}</p>
                          <p className="text-xs text-gray-500 truncate">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {book.category_name || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`badge ${book.available_copies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {book.available_copies}/{book.total_copies}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{book.borrow_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(book)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(book)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
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

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Ajouter un livre' : 'Modifier le livre'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {msg && <Alert type={msg.type} message={msg.text} />}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input type="text" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Auteur *</label>
              <input type="text" value={form.author || ''} onChange={e => setForm({ ...form, author: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
              <input type="text" value={form.isbn || ''} onChange={e => setForm({ ...form, isbn: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select value={form.category_id || ''} onChange={e => setForm({ ...form, category_id: e.target.value })} className="input-field">
                <option value="">Aucune catégorie</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Éditeur</label>
              <input type="text" value={form.publisher || ''} onChange={e => setForm({ ...form, publisher: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Année de publication</label>
              <input type="number" value={form.published_year || ''} onChange={e => setForm({ ...form, published_year: e.target.value })} className="input-field" min="1000" max="2099" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de pages</label>
              <input type="number" value={form.pages || ''} onChange={e => setForm({ ...form, pages: e.target.value })} className="input-field" min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
              <select value={form.language || 'Français'} onChange={e => setForm({ ...form, language: e.target.value })} className="input-field">
                {['Français', 'Anglais', 'Arabe', 'Espagnol', 'Allemand', 'Autre'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows={3} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image de couverture</label>
              <div className="flex items-center gap-3">
                {(form.cover_image || coverFile) && (
                  <img
                    src={coverFile ? URL.createObjectURL(coverFile) : process.env.NEXT_PUBLIC_BASE_URL + form.cover_image}
                    alt="Preview"
                    className="w-12 h-16 object-cover rounded-lg border border-gray-200"
                  />
                )}
                <label className="cursor-pointer btn-secondary flex items-center gap-2 text-sm">
                  <FiImage />
                  {coverFile ? coverFile.name : 'Choisir une image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setCoverFile(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(null)} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement...' : modal === 'create' ? 'Ajouter' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
