import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FiBook, FiMail, FiLock } from 'react-icons/fi';
import Alert from '../../components/ui/Alert';

export default function LoginPage({ setUser }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', form);
      setUser(data.user);
      router.push(data.user.role === 'admin' || data.user.role === 'bibliothecaire' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiBook className="text-white text-2xl" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Connexion</h1>
          <p className="text-gray-500 mt-1">Accédez à votre compte bibliothèque</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-9"
                  placeholder="email@fst.uhp.ma"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-9"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
