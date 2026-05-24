import Link from 'next/link';
import { FiHome, FiBook } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <FiBook className="text-primary-400 text-4xl" />
        </div>
        <h1 className="font-display text-6xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-xl text-gray-500 mb-8">Page introuvable</p>
        <Link href="/" className="btn-primary flex items-center gap-2 w-fit mx-auto">
          <FiHome /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
