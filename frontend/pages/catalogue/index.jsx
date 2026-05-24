import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import BookCard from '../../components/ui/BookCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import { FiBook, FiSearch, FiFilter } from 'react-icons/fi';

export default function CataloguePage() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const LIMIT = 12;

  const { search = '', category = '', sort = 'popular' } = router.query;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchBooks(1);
  }, [search, category, sort]);

  async function fetchCategories() {
    try {
      const { data } = await axios.get('/api/categories');
      setCategories(data.categories);
    } catch {}
  }

  async function fetchBooks(p = page) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: LIMIT, sort });
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      const { data } = await axios.get(`/api/books?${params}`);
      setBooks(data.books);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  }

  function handlePageChange(p) {
    setPage(p);
    fetchBooks(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setQuery(key, value) {
    const q = { ...router.query };
    if (value) q[key] = value; else delete q[key];
    router.push({ pathname: '/catalogue', query: q }, undefined, { shallow: true });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Catalogue</h1>
        <p className="text-gray-500">Explorez notre collection de livres</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un titre, auteur..."
            value={search}
            onChange={e => setQuery('search', e.target.value)}
            className="input-field pl-9"
          />
        </div>

        <select
          value={category}
          onChange={e => setQuery('category', e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="">Toutes les catégories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={e => setQuery('sort', e.target.value)}
          className="input-field sm:w-40"
        >
          <option value="popular">Populaires</option>
          <option value="recent">Récents</option>
          <option value="alpha">A → Z</option>
        </select>
      </div>

      {search && (
        <p className="text-sm text-gray-500 mb-4">
          {total} résultat{total !== 1 ? 's' : ''} pour <span className="font-medium text-gray-900">"{search}"</span>
        </p>
      )}

      {loading ? (
        <LoadingSpinner text="Chargement des livres..." />
      ) : books.length === 0 ? (
        <EmptyState
          icon={FiBook}
          title="Aucun livre trouvé"
          description="Essayez avec d'autres mots-clés ou une autre catégorie."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {books.map(book => <BookCard key={book.id} book={book} />)}
          </div>
          <Pagination page={page} total={total} limit={LIMIT} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}
