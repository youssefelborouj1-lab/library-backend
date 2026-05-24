import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiBook, FiClock,
  FiBookmark, FiBell, FiEdit2, FiSave, FiX, FiAlertTriangle
} from 'react-icons/fi';

export default function ProfilePage({ user }) {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [borrows, setBorrows] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('borrows');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    fetchAll();
  }, [user]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [profileRes, borrowsRes, reservRes, notifRes] = await Promise.all([
        axios.get('/api/users/profile'),
        axios.get('/api/borrows'),
        axios.get('/api/reservations'),
        axios.get('/api/users/notifications'),
      ]);
      setProfile(profileRes.data.profile);
      setStats(profileRes.data.stats);
      setForm({
        name: profileRes.data.profile.name,
        phone: profileRes.data.profile.phone || '',
        address: profileRes.data.profile.address || '',
      });
      setBorrows(borrowsRes.data.borrows);
      setReservations(reservRes.data.reservations);
      setNotifications(notifRes.data.notifications);
    } catch {}
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      await axios.put('/api/users/profile', form);
      setMsg({ type: 'success', text: 'Profil mis à jour avec succès' });
      setEditing(false);
      fetchAll();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Erreur lors de la mise à jour' });
    }
    setSaving(false);
  }

  async function handleCancelReservation(id) {
    try {
      await axios.delete(`/api/reservations/${id}`);
      fetchAll();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Erreur' });
    }
  }

  async function markNotificationsRead() {
    await axios.put('/api/users/notifications');
    fetchAll();
  }

  if (!user) return null;
  if (loading) return <LoadingSpinner text="Chargement du profil..." />;

  const tabs = [
    { key: 'borrows', label: 'Emprunts', icon: FiBook, count: stats?.active_borrows },
    { key: 'reservations', label: 'Réservations', icon: FiBookmark, count: stats?.active_reservations },
    { key: 'notifications', label: 'Notifications', icon: FiBell, count: notifications.filter(n => !n.is_read).length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4">
          <div className="card p-6 text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="text-primary-600 text-3xl" />
            </div>
            {!editing ? (
              <>
                <h2 className="font-display font-bold text-xl text-gray-900">{profile?.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{profile?.email}</p>
                <span className={`badge mt-2 ${profile?.role === 'admin' ? 'bg-purple-100 text-purple-700' : profile?.role === 'bibliothecaire' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {profile?.role}
                </span>
                <div className="mt-4 space-y-2 text-left">
                  {profile?.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <FiPhone className="flex-shrink-0 text-gray-400" /> {profile.phone}
                    </p>
                  )}
                  {profile?.address && (
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <FiMapPin className="flex-shrink-0 text-gray-400" /> {profile.address}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="mt-4 btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                >
                  <FiEdit2 /> Modifier le profil
                </button>
              </>
            ) : (
              <div className="text-left space-y-3">
                <h3 className="font-semibold text-gray-900 text-center mb-2">Modifier le profil</h3>
                {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="input-field text-sm"
                    placeholder="+33 6 00 00 00 00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Adresse</label>
                  <textarea
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className="input-field text-sm resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-1 text-sm">
                    <FiSave /> {saving ? 'Enregistrement...' : 'Sauvegarder'}
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-secondary px-3">
                    <FiX />
                  </button>
                </div>
              </div>
            )}
          </div>

          {stats && (
            <div className="card p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Statistiques</h3>
              <StatRow label="Total emprunts" value={stats.total_borrows} />
              <StatRow label="Emprunts actifs" value={stats.active_borrows} color="text-blue-600" />
              <StatRow label="Emprunts en retard" value={stats.overdue_borrows} color="text-red-600" />
              <StatRow label="Réservations actives" value={stats.active_reservations} color="text-purple-600" />
            </div>
          )}
        </aside>

        <div>
          {msg && !editing && (
            <div className="mb-4">
              <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />
            </div>
          )}

          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <t.icon className="text-sm" />
                {t.label}
                {t.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === 'borrows' && (
            <div>
              {borrows.length === 0 ? (
                <EmptyState icon={FiBook} title="Aucun emprunt" description="Vous n'avez pas encore emprunté de livre." />
              ) : (
                <div className="space-y-3">
                  {borrows.map(borrow => (
                    <BorrowCard key={borrow.id} borrow={borrow} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'reservations' && (
            <div>
              {reservations.length === 0 ? (
                <EmptyState icon={FiBookmark} title="Aucune réservation" description="Vous n'avez pas de réservation en cours." />
              ) : (
                <div className="space-y-3">
                  {reservations.map(res => (
                    <ReservationCard key={res.id} reservation={res} onCancel={handleCancelReservation} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'notifications' && (
            <div>
              {notifications.length > 0 && notifications.some(n => !n.is_read) && (
                <div className="flex justify-end mb-3">
                  <button onClick={markNotificationsRead} className="text-sm text-primary-600 hover:text-primary-700">
                    Tout marquer comme lu
                  </button>
                </div>
              )}
              {notifications.length === 0 ? (
                <EmptyState icon={FiBell} title="Aucune notification" description="Vous n'avez pas de notification." />
              ) : (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`card p-4 ${!n.is_read ? 'border-l-4 border-l-primary-500' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{n.title}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(n.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!n.is_read && (
                          <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, color = 'text-gray-900' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function BorrowCard({ borrow }) {
  const isOverdue = borrow.status === 'overdue' || (borrow.status === 'active' && new Date(borrow.due_date) < new Date());
  const daysLeft = Math.ceil((new Date(borrow.due_date) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className={`card p-4 flex items-start gap-4 ${isOverdue && borrow.status !== 'returned' ? 'border-l-4 border-l-red-400' : ''}`}>
      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <FiBook className="text-primary-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{borrow.title}</p>
        <p className="text-sm text-gray-500">{borrow.author}</p>
        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <FiClock className="flex-shrink-0" />
            Emprunté le {new Date(borrow.borrowed_at).toLocaleDateString('fr-FR')}
          </span>
          {borrow.status !== 'returned' && (
            <span className={`text-xs font-medium flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
              {isOverdue && <FiAlertTriangle />}
              {isOverdue ? `En retard de ${Math.abs(daysLeft)} jour(s)` : `Retour dans ${daysLeft} jour(s)`}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Code exemplaire : {borrow.copy_code}</p>
      </div>
      <StatusPill status={borrow.status} isOverdue={isOverdue} />
    </div>
  );
}

function ReservationCard({ reservation, onCancel }) {
  return (
    <div className="card p-4 flex items-start gap-4">
      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <FiBookmark className="text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{reservation.title}</p>
        <p className="text-sm text-gray-500">{reservation.author}</p>
        <p className="text-xs text-gray-400 mt-1">
          Réservé le {new Date(reservation.reserved_at).toLocaleDateString('fr-FR')}
          {reservation.expires_at && ` · Expire le ${new Date(reservation.expires_at).toLocaleDateString('fr-FR')}`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <ReservationBadge status={reservation.status} />
        {['pending', 'confirmed'].includes(reservation.status) && (
          <button
            onClick={() => onCancel(reservation.id)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status, isOverdue }) {
  if (isOverdue && status !== 'returned') return <span className="badge bg-red-100 text-red-700 flex-shrink-0">En retard</span>;
  const map = {
    active: { label: 'Actif', cls: 'bg-blue-100 text-blue-700' },
    returned: { label: 'Retourné', cls: 'bg-green-100 text-green-700' },
    overdue: { label: 'En retard', cls: 'bg-red-100 text-red-700' },
  };
  const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`badge flex-shrink-0 ${s.cls}`}>{s.label}</span>;
}

function ReservationBadge({ status }) {
  const map = {
    pending: { label: 'En attente', cls: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Confirmée', cls: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Annulée', cls: 'bg-gray-100 text-gray-500' },
    expired: { label: 'Expirée', cls: 'bg-red-100 text-red-600' },
  };
  const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`badge flex-shrink-0 ${s.cls}`}>{s.label}</span>;
}
