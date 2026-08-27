import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Icon from '../../components/Icon';

const tabs = [
  { key: 'overview', label: 'Overview', icon: 'dashboard' },
  { key: 'mechanics', label: 'Mechanics', icon: 'build' },
  { key: 'users', label: 'Users', icon: 'people' },
  { key: 'payments', label: 'Payments', icon: 'payments' },
];

const statusColors = {
  approved: 'bg-[#E6F4EA] text-[#1E7E34]',
  pending: 'bg-[#FFF3E0] text-[#E65100]',
  rejected: 'bg-error-container/30 text-error',
  suspended: 'bg-error-container/30 text-error',
  active: 'bg-[#E6F4EA] text-[#1E7E34]',
  confirmed: 'bg-[#E6F4EA] text-[#1E7E34]',
  failed: 'bg-error-container/30 text-error',
  cancelled: 'bg-surface-container-high text-on-surface-variant',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [mechanics, setMechanics] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (tab === 'mechanics' || tab === 'overview') {
      api.get('/admin/mechanics').then(({ data }) => setMechanics(data.mechanics || [])).catch(() => setMechanics([])).finally(() => setLoading(false));
    } else if (tab === 'users') {
      api.get('/admin/users').then(({ data }) => setUsers(data.users || [])).catch(() => setUsers([])).finally(() => setLoading(false));
    } else {
      api.get('/admin/payments').then(({ data }) => setPayments(data.payments || [])).catch(() => setPayments([])).finally(() => setLoading(false));
    }
  }, [tab]);

  async function updateMechanicStatus(id, status) {
    try {
      await api.patch(`/admin/mechanics/${id}/status`, { status });
      setMechanics((prev) => prev.map((m) => m.id === id ? { ...m, approvalStatus: status } : m));
    } catch { /* empty */ }
  }

  async function updateUserStatus(id, status) {
    try {
      await api.patch(`/admin/users/${id}/status`, { status });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));
    } catch { /* empty */ }
  }

  async function confirmPayment(id) {
    try {
      await api.post(`/admin/payments/${id}/confirm`);
      setPayments((prev) => prev.map((p) => p.id === id ? { ...p, status: 'confirmed' } : p));
    } catch { /* empty */ }
  }

  const pendingMechanics = mechanics.filter((m) => m.approvalStatus === 'pending').length;
  const approvedMechanics = mechanics.filter((m) => m.approvalStatus === 'approved').length;
  const pendingPayments = payments.filter((p) => p.status === 'pending').length;
  const totalRevenue = payments.filter((p) => p.status === 'confirmed').reduce((sum, p) => sum + (p.amountFcfa || 0), 0);

  if (loading && tab === 'overview') {
    return (
      <main className="pt-[72px] min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <Icon name="progress_activity" size="text-[40px]" className="animate-spin text-primary" />
          <p className="text-sm text-on-surface-variant">Loading admin panel...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-[72px] min-h-screen bg-surface">
      {/* Mobile tab bar */}
      <div className="lg:hidden sticky top-[72px] z-40 bg-white/95 backdrop-blur-xl border-b border-outline-variant/40">
        <div className="flex overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                tab === t.key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
              }`}>
              <Icon name={t.icon} size="text-[16px]" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-72px)]">
        {/* Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-[72px] h-[calc(100vh-72px)] border-r border-outline-variant/30 bg-white p-6 flex flex-col">
            {/* Profile card */}
            <div className="mb-6 pb-6 border-b border-outline-variant/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0B1F3A] flex items-center justify-center text-white font-bold text-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{user?.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0B1F3A]/5">
                <Icon name="admin_panel_settings" size="text-[16px]" className="text-[#0B1F3A]" />
                <span className="text-xs font-semibold text-[#0B1F3A]">Administrator</span>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    tab === t.key
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}>
                  <Icon name={t.icon} size="text-[20px]" /> {t.label}
                </button>
              ))}
            </nav>

            {/* Quick stats in sidebar */}
            <div className="pt-4 border-t border-outline-variant/20 mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Pending approvals</span>
                {pendingMechanics > 0 ? (
                  <span className="w-6 h-6 rounded-full bg-[#E65100] text-white text-[11px] font-bold flex items-center justify-center">{pendingMechanics}</span>
                ) : (
                  <span className="text-xs text-on-surface-variant">0</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Pending payments</span>
                {pendingPayments > 0 ? (
                  <span className="w-6 h-6 rounded-full bg-[#E65100] text-white text-[11px] font-bold flex items-center justify-center">{pendingPayments}</span>
                ) : (
                  <span className="text-xs text-on-surface-variant">0</span>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 p-5 lg:p-10">

          {/* ─── Overview ─── */}
          {tab === 'overview' && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-on-surface">Admin Dashboard</h1>
                <p className="text-sm text-on-surface-variant mt-1">MecaFind platform overview and management</p>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: 'build', label: 'Total Mechanics', value: mechanics.length, color: 'bg-primary' },
                  { icon: 'check_circle', label: 'Approved', value: approvedMechanics, color: 'bg-[#1E7E34]' },
                  { icon: 'pending', label: 'Pending Approval', value: pendingMechanics, color: 'bg-[#E65100]' },
                  { icon: 'payments', label: 'Revenue', value: `${(totalRevenue / 1000).toFixed(0)}K`, color: 'bg-tertiary', sub: 'FCFA' },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 ring-1 ring-outline-variant/20 hover:ring-outline-variant/40 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                        <Icon name={s.icon} size="text-[18px]" className="text-white" />
                      </div>
                      <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">{s.label}</span>
                    </div>
                    <p className="text-3xl font-bold text-on-surface">{s.value}{s.sub && <span className="text-base font-semibold text-on-surface-variant ml-1">{s.sub}</span>}</p>
                  </div>
                ))}
              </div>

              {/* Quick actions + Recent */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 ring-1 ring-outline-variant/20">
                  <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-4">Quick Actions</h2>
                  <div className="space-y-2">
                    {[
                      { key: 'mechanics', icon: 'build', label: 'Review Mechanics', desc: `${pendingMechanics} pending`, badge: pendingMechanics },
                      { key: 'payments', icon: 'payments', label: 'Confirm Payments', desc: `${pendingPayments} pending`, badge: pendingPayments },
                      { key: 'users', icon: 'people', label: 'Manage Users', desc: `${users.length} total` },
                    ].map((a) => (
                      <button key={a.key} onClick={() => setTab(a.key)}
                        className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low hover:bg-primary/5 hover:ring-1 hover:ring-primary/20 text-left transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-white ring-1 ring-outline-variant/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                          <Icon name={a.icon} size="text-[18px]" className="text-on-surface-variant group-hover:text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-on-surface">{a.label}</p>
                          <p className="text-[11px] text-on-surface-variant">{a.desc}</p>
                        </div>
                        {a.badge > 0 && (
                          <span className="w-6 h-6 rounded-full bg-[#E65100] text-white text-[11px] font-bold flex items-center justify-center">{a.badge}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-3 bg-white rounded-2xl p-6 ring-1 ring-outline-variant/20">
                  <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-4">Recent Payments</h2>
                  {payments.length === 0 ? (
                    <div className="py-8 text-center">
                      <Icon name="payments" size="text-[32px]" className="text-on-surface-variant/30 mx-auto mb-2" />
                      <p className="text-xs text-on-surface-variant">No payments yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {payments.slice(0, 5).map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon name="account_balance_wallet" size="text-[16px]" className="text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-on-surface">{p.userName}</p>
                              <p className="text-[11px] text-on-surface-variant">{p.amountFcfa.toLocaleString()} FCFA &middot; {p.provider}</p>
                            </div>
                          </div>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColors[p.status] || ''}`}>
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── Mechanics ─── */}
          {tab === 'mechanics' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-on-surface">Manage Mechanics</h1>
                <p className="text-sm text-on-surface-variant mt-1">Review, approve, or suspend mechanic workshops</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-16"><Icon name="progress_activity" size="text-[40px]" className="animate-spin text-primary" /></div>
              ) : mechanics.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center ring-1 ring-outline-variant/20">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center mx-auto mb-4">
                    <Icon name="build" size="text-[28px]" className="text-on-surface-variant" />
                  </div>
                  <p className="text-sm font-semibold text-on-surface mb-1">No mechanics registered</p>
                  <p className="text-xs text-on-surface-variant">Mechanics will appear here once they sign up</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl ring-1 ring-outline-variant/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                          <th className="px-5 py-3.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Workshop</th>
                          <th className="px-5 py-3.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Mechanic</th>
                          <th className="px-5 py-3.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                          <th className="px-5 py-3.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Created</th>
                          <th className="px-5 py-3.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mechanics.map((m) => (
                          <tr key={m.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/30 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <Icon name="storefront" size="text-[16px]" className="text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-on-surface">{m.workshopName}</p>
                                  <p className="text-xs text-on-surface-variant">{m.address}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-sm text-on-surface">{m.mechanicName}</p>
                              <p className="text-xs text-on-surface-variant">{m.email}</p>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[m.approvalStatus] || 'bg-surface-container-high text-on-surface-variant'}`}>
                                {m.approvalStatus}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs text-on-surface-variant">{new Date(m.createdAt).toLocaleDateString()}</td>
                            <td className="px-5 py-4">
                              <div className="flex gap-1.5">
                                {m.approvalStatus !== 'approved' && (
                                  <button onClick={() => updateMechanicStatus(m.id, 'approved')}
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[#E6F4EA] text-[#1E7E34] hover:bg-[#C8E6C9] transition-colors">
                                    Approve
                                  </button>
                                )}
                                {m.approvalStatus !== 'rejected' && (
                                  <button onClick={() => updateMechanicStatus(m.id, 'rejected')}
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-error-container/30 text-error hover:bg-error-container/50 transition-colors">
                                    Reject
                                  </button>
                                )}
                                {m.approvalStatus !== 'suspended' && m.approvalStatus !== 'rejected' && (
                                  <button onClick={() => updateMechanicStatus(m.id, 'suspended')}
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors">
                                    Suspend
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Users ─── */}
          {tab === 'users' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-on-surface">Manage Users</h1>
                <p className="text-sm text-on-surface-variant mt-1">View and manage registered users</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-16"><Icon name="progress_activity" size="text-[40px]" className="animate-spin text-primary" /></div>
              ) : users.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center ring-1 ring-outline-variant/20">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center mx-auto mb-4">
                    <Icon name="people" size="text-[28px]" className="text-on-surface-variant" />
                  </div>
                  <p className="text-sm font-semibold text-on-surface mb-1">No users registered</p>
                  <p className="text-xs text-on-surface-variant">Users will appear here once they sign up</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl ring-1 ring-outline-variant/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                          <th className="px-5 py-3.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">User</th>
                          <th className="px-5 py-3.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Role</th>
                          <th className="px-5 py-3.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                          <th className="px-5 py-3.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/30 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                                  <span className="text-xs font-bold text-secondary">{u.name?.charAt(0)?.toUpperCase()}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-on-surface">{u.name}</p>
                                  <p className="text-xs text-on-surface-variant">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary capitalize">{u.role.replace('_', ' ')}</span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[u.status] || 'bg-surface-container-high text-on-surface-variant'}`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              {u.status === 'active' ? (
                                <button onClick={() => updateUserStatus(u.id, 'suspended')}
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-error-container/30 text-error hover:bg-error-container/50 transition-colors">
                                  Suspend
                                </button>
                              ) : (
                                <button onClick={() => updateUserStatus(u.id, 'active')}
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[#E6F4EA] text-[#1E7E34] hover:bg-[#C8E6C9] transition-colors">
                                  Activate
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Payments ─── */}
          {tab === 'payments' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-on-surface">Payment Records</h1>
                <p className="text-sm text-on-surface-variant mt-1">Review and confirm user payments</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-16"><Icon name="progress_activity" size="text-[40px]" className="animate-spin text-primary" /></div>
              ) : payments.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center ring-1 ring-outline-variant/20">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center mx-auto mb-4">
                    <Icon name="payments" size="text-[28px]" className="text-on-surface-variant" />
                  </div>
                  <p className="text-sm font-semibold text-on-surface mb-1">No payments yet</p>
                  <p className="text-xs text-on-surface-variant">Payment records will appear here</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl ring-1 ring-outline-variant/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                          <th className="px-5 py-3.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">User</th>
                          <th className="px-5 py-3.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Amount</th>
                          <th className="px-5 py-3.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Provider</th>
                          <th className="px-5 py-3.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Uses</th>
                          <th className="px-5 py-3.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                          <th className="px-5 py-3.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Date</th>
                          <th className="px-5 py-3.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/30 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <span className="text-xs font-bold text-primary">{p.userName?.charAt(0)?.toUpperCase()}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-on-surface">{p.userName}</p>
                                  <p className="text-xs text-on-surface-variant">{p.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm font-semibold text-on-surface">{p.amountFcfa.toLocaleString()} FCFA</td>
                            <td className="px-5 py-4 text-sm text-on-surface-variant capitalize">{p.provider.replace('_', ' ')}</td>
                            <td className="px-5 py-4 text-sm text-on-surface">{p.usagesGranted}</td>
                            <td className="px-5 py-4">
                              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[p.status] || 'bg-surface-container-high text-on-surface-variant'}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs text-on-surface-variant">{new Date(p.createdAt).toLocaleDateString()}</td>
                            <td className="px-5 py-4">
                              {p.status === 'pending' && (
                                <button onClick={() => confirmPayment(p.id)}
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[#E6F4EA] text-[#1E7E34] hover:bg-[#C8E6C9] transition-colors">
                                  Confirm
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
