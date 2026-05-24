import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import BookCard from '../../components/ui/BookCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import {
  FiBook, FiUser, FiTag, FiCalendar, FiLayers, FiBookmark,
  FiArrowLeft, FiGlobe, FiFileText, FiCheckCircle, FiXCircle
} from 'react-icons/fi';

export default function BookDetailPage({ user }) {
  const router = useRouter();
  const { id } = router.query;
  const [book, setBook] = useState(null);
  const [copies, setCopies] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (id) fetchBook();
  }, [id]);

  async function fetchBook() {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/books/${id}`);
      setBook(data.book);
      setCopies(data.copies);
      setSimilar(data.similar);
    } catch {
      router.push('/catalogue');
    }
    setLoading(false);
  }

  async function handleReserve() {
    if (!user) return router.push('/auth/login');
    setReserving(true);
    setMsg(null);
    try {
      await axios.post('/api/reservations', { book_id: id });
      setMsg({ type: 'success', text: 'Réservation effectuée avec succès !' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Erreur de réservation' });
    }
    setReserving(false);
  }

  if (loading) return <LoadingSpinner text="Chargement..." />;
  if (!book) return null;

  const available = book.available_copies > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/catalogue" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 w-fit">
        <FiArrowLeft /> Retour au catalogue
      </Link>

      <div className="grid md:grid-cols-[280px_1fr] gap-8 mb-12">
        <div>
          <div className="aspect-[3/4] bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl overflow-hidden shadow-md">
            {book.cover_image ? (
              <img src={process.env.NEXT_PUBLIC_BASE_URL + book.cover_image} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiBook className="text-primary-300 text-7xl" />
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className={`flex items-center gap-2 p-3 rounded-xl ${available ? 'bg-green-50' : 'bg-red-50'}`}>
              {available ? (
                <FiCheckCircle className="text-green-500 flex-shrink-0" />
              ) : (
                <FiXCircle className="text-red-500 flex-shrink-0" />
              )}
              <div>
                <p className={`text-sm font-medium ${available ? 'text-green-700' : 'text-red-700'}`}>
                  {available ? `${book.available_copies} exemplaire(s) disponible(s)` : 'Aucun exemplaire disponible'}
                </p>
                <p className="text-xs text-gray-500">{book.total_copies} exemplaire(s) au total</p>
              </div>
            </div>

            {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}
           
            {user && (
              <button
                onClick={handleReserve}
                disabled={reserving}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <FiBookmark />
                {reserving ? 'Réservation...' : 'Réserver ce livre'}
              </button>
            )}

            {!user && !available && (
              <Link href="/auth/login" className="btn-primary w-full flex items-center justify-center gap-2">
                <FiBookmark /> Se connecter pour réserver
              </Link>
            )}
          </div>
        </div>

        <div>
          {book.category_name && (
            <span className="badge bg-primary-100 text-primary-700 mb-3 inline-flex">
              <FiTag className="mr-1" /> {book.category_name}
            </span>
          )}
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
          <p className="text-xl text-gray-600 mb-6 flex items-center gap-2">
            <FiUser className="text-gray-400" /> {book.author}
          </p>

          {book.description && (
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{book.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6">
            {book.isbn && (
              <InfoRow icon={FiFileText} label="ISBN" value={book.isbn} />
            )}
            {book.publisher && (
              <InfoRow icon={FiBook} label="Éditeur" value={book.publisher} />
            )}
            {book.published_year && (
              <InfoRow icon={FiCalendar} label="Année" value={book.published_year} />
            )}
            {book.pages && (
              <InfoRow icon={FiLayers} label="Pages" value={`${book.pages} pages`} />
            )}
            {book.language && (
              <InfoRow icon={FiGlobe} label="Langue" value={book.language} />
            )}
            <InfoRow icon={FiBook} label="Emprunts" value={`${book.borrow_count} fois`} />
          </div>

          {copies.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Exemplaires</h2>
              <div className="space-y-2">
                {copies.map(copy => (
                  <div key={copy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <span className="text-sm font-medium text-gray-700">{copy.code}</span>
                      {copy.location && <span className="text-xs text-gray-400 ml-2">• {copy.location}</span>}
                    </div>
                    <StatusBadge status={copy.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Livres similaires</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {similar.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
      <Icon className="text-gray-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    available: { label: 'Disponible', cls: 'bg-green-100 text-green-700' },
    borrowed: { label: 'Emprunté', cls: 'bg-orange-100 text-orange-700' },
    reserved: { label: 'Réservé', cls: 'bg-blue-100 text-blue-700' },
    damaged: { label: 'Endommagé', cls: 'bg-red-100 text-red-700' },
    lost: { label: 'Perdu', cls: 'bg-gray-100 text-gray-700' },
  };
  const s = map[status] || map.available;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
