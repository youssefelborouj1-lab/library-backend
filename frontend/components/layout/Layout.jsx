import Navbar from './Navbar';

export default function Layout({ children, user, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      <main>{children}</main>
    </div>
  );
}
