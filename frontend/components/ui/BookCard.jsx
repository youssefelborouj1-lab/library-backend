import Link from 'next/link';
import { FiBook, FiUser, FiTag } from 'react-icons/fi';

export default function BookCard({ book }) {
  const available = book.available_copies > 0;

  return (
    <Link href={`/catalogue/${book.id}`} className="card hover:shadow-md transition-shadow duration-200 overflow-hidden group block">
      <div className="aspect-[3/4] bg-gradient-to-br from-primary-50 to-primary-100 relative overflow-hidden">
        {book.cover_image ? (
          <img
            src={process.env.NEXT_PUBLIC_BASE_URL + book.cover_image}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FiBook className="text-primary-300 text-5xl" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`badge ${available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {available ? `${book.available_copies} Disponible${book.available_copies > 1 ? 's' : ''}` : 'A réserver'}
          </span>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug mb-1">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <FiUser className="flex-shrink-0" />
          <span className="truncate">{book.author}</span>
        </p>
        {book.category_name && (
          <p className="text-xs text-primary-600 flex items-center gap-1 mt-1">
            <FiTag className="flex-shrink-0" />
            <span className="truncate">{book.category_name}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
