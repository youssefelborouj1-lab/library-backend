import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import BookCard from '../components/ui/BookCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { FiSearch, FiBook, FiX, FiClock } from 'react-icons/fi';

export default function SearchPage({ user }) {
  const router = useRouter();
  const [query, setQuery] = useState(router.query.q || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [history, setHistory] = useState([]);
  const inputRef = useRef();
  const debounceRef = useRef();

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    const saved = JSON.parse(localStorage.getItem('search_history') || '[]');
    setHistory(saved);
    if (router.query.q) {
      setQuery(router.query.q);
      performSearch(router.query.q);
    }
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        performSearch(query);
      }, 400);
    } else {
      setResults([]);
      setSearched(false);
    }
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function performSearch(q) {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/books?search=${encodeURIComponent(q)}&limit=50`);
      setResults(data.books);
      setSearched(true);

      const saved = JSON.parse(localStorage.getItem('search_history') || '[]');
      const updated = [q, ...saved.filter(s => s !== q)].slice(0, 8);
      localStorage.setItem('search_history', JSON.stringify(updated));
      setHistory(updated);
    } catch {}
    setLoading(false);
  }

  function clearHistory() {
    localStorage.removeItem('search_history');
    setHistory([]);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Recherche intelligente</h1>
      <p className="text-gray-500 mb-6">Recherchez par titre, auteur, catégorie ou mots-clés</p>

      <div className="relative mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Algorithmes, physique quantique, Victor Hugo..."
          className="w-full pl-11 pr-10 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base shadow-sm"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX />
          </button>
        )}
      </div>

      {!searched && !loading && query.length < 2 && history.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <FiClock className="text-gray-400" /> Recherches récentes
            </p>
            <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-gray-600">Effacer</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map(h => (
              <button
                key={h}
                onClick={() => setQuery(h)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Recherche en cours..." />
      ) : searched && results.length === 0 ? (
        <EmptyState
          icon={FiBook}
          title="Aucun résultat"
          description={`Aucun livre trouvé pour "${query}". Essayez avec d'autres mots-clés.`}
        />
      ) : results.length > 0 ? (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            <span className="font-medium text-gray-900">{results.length}</span> résultat{results.length !== 1 ? 's' : ''} trouvé{results.length !== 1 ? 's' : ''} — triés par pertinence
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <FiSearch className="text-5xl mx-auto mb-3 opacity-30" />
          <p className="text-lg">Commencez à taper pour rechercher</p>
        </div>
      )}
    </div>
  );
}
