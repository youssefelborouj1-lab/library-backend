import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import BookCard from '../components/ui/BookCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FiBook, FiSearch, FiUsers, FiAward, FiArrowRight } from 'react-icons/fi';

export default function HomePage({ user }) {
  const [popularBooks, setPopularBooks] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  async function fetchData() {
    setLoading(true);
    try {
      const [booksRes, catsRes] = await Promise.all([
        axios.get('/api/books?limit=8&sort=popular'),
        axios.get('/api/categories'),
      ]);
      setPopularBooks(booksRes.data.books.slice(0, 4));
      setRecentBooks(booksRes.data.books.slice(4, 8));
      setCategories(catsRes.data.categories.slice(0, 6));

      if (user) {
        const recRes = await axios.get('/api/users/recommendations');
        setRecommendations(recRes.data.recommendations.slice(0, 4));
      }
    } catch {}
    setLoading(false);
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-5xl font-bold mb-4 leading-tight">
            Bibliothèque Universitaire
          </h1>
          <p className="text-primary-100 text-xl mb-8 max-w-2xl mx-auto">
            Accédez à des milliers de livres, gérez vos emprunts et découvrez de nouvelles lectures.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/catalogue" className="bg-white text-primary-700 hover:bg-primary-50 font-semibold px-8 py-3 rounded-xl transition-colors">
              Explorer le catalogue
            </Link>
            {!user && (
              <Link href="/auth/register" className="bg-primary-500 hover:bg-primary-400 border border-primary-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
                S'inscrire gratuitement
              </Link>
            )}
            {user && (
              <Link href="/search" className="bg-primary-500 hover:bg-primary-400 border border-primary-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center gap-2 justify-center">
                <FiSearch /> Rechercher
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { icon: FiBook, value: '10,000+', label: 'Livres disponibles' },
            { icon: FiUsers, value: '2,500+', label: 'Étudiants inscrits' },
            { icon: FiAward, value: '150+', label: 'Catégories' },
            { icon: FiSearch, value: '24/7', label: 'Accès en ligne' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Icon className="text-primary-600 text-xl" />
              </div>
              <p className="font-display font-bold text-2xl text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {loading ? (
        <LoadingSpinner text="Chargement..." />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-gray-900">Livres populaires</h2>
              <Link href="/catalogue?sort=popular" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium">
                Voir tout <FiArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {popularBooks.map(book => <BookCard key={book.id} book={book} />)}
            </div>
          </section>

          {user && recommendations.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-gray-900">Recommandés pour vous</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {recommendations.map(book => <BookCard key={book.id} book={book} />)}
              </div>
            </section>
          )}

          {categories.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Parcourir par catégorie</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/catalogue?category=${cat.id}`}
                    className="card p-4 hover:shadow-md transition-shadow group"
                  >
                    <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{cat.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{cat.book_count} livre{cat.book_count !== 1 ? 's' : ''}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
