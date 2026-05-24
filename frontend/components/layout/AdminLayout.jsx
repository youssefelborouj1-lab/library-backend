import { useState } from 'react';
import Navbar from './Navbar';
import AdminSidebar from './AdminSidebar';
import { FiMenu, FiX } from 'react-icons/fi';

export default function AdminLayout({ children, user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navbar user={user} onLogout={onLogout} />

      <div className="flex relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="
            lg:hidden fixed bottom-5 right-5 z-50
            w-14 h-14 rounded-full
            bg-[#003366] text-white
            flex items-center justify-center
            shadow-2xl
            transition-all duration-300
            hover:scale-105 active:scale-95
          "
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <div
          className={`
            fixed lg:sticky top-0 left-0 z-50 lg:z-10
            h-screen
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
          `}
        >
          <AdminSidebar />
        </div>

        <main
          className="
            flex-1 min-w-0
            p-3 sm:p-4 md:p-6
            w-full
            lg:ml-0
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}