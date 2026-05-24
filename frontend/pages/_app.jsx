import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import AdminLayout from '../components/layout/AdminLayout';
import '../styles/globals.css';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const { data } = await axios.get('/api/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await axios.post('/api/auth/logout');
    setUser(null);
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  const isAdmin = router.pathname.startsWith('/admin');
  const LayoutComponent = isAdmin ? AdminLayout : Layout;

  return (
    <AuthContext.Provider value={{ user, setUser, fetchUser }}>
      <LayoutComponent user={user} onLogout={handleLogout}>
        <Component {...pageProps} user={user} setUser={setUser} fetchUser={fetchUser} />
      </LayoutComponent>
    </AuthContext.Provider>
  );
}
