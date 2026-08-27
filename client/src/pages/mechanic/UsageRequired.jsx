import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';

export default function UsageRequired() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [modal, setModal] = useState({ open: false, title: '', message: '', variant: 'info' });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get('/usage/me').catch(() => ({ data: {} })),
      api.get('/usage/transactions').catch(() => ({ data: { transactions: [] } })),
      api.get('/usage/payments').catch(() => ({ data: { payments: [] } })),
    ]).then(([w, t, p]) => {
      setWallet(w.data);
      setTransactions(t.data.transactions || []);
      setPayments(p.data.payments || []);
    }).finally(() => setLoading(false));
  }, [user]);

  async function handleBuy() {
    setBuying(true);
    try {
      await api.post('/usage/payments/checkout', { provider: 'manual' });
      const { data } = await api.get('/usage/payments');
      setPayments(data.payments || []);
      setModal({ open: true, title: 'Payment Created', message: 'An admin will confirm your purchase.', variant: 'success' });
    } catch {
      setModal({ open: true, title: 'Payment Failed', message: 'Failed to create payment. Please try again.', variant: 'error' });
    } finally {
      setBuying(false);
    }
  }

  if (!user) return null;

  const totalUses = (wallet?.freeUsesRemaining ?? 0) + (wallet?.paidUsesRemaining ?? 0);
  const recentTx = transactions.slice(0, 5);
  const recentPayments = payments.slice(0, 5);

  return (
    <main className="pt-[72px] min-h-screen bg-surface">
      {/* Hero banner */}
      <div className="bg-[#0B1F3A] text-white">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-16 py-10 lg:py-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-inverse-primary/60 mb-2">Account</p>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">My Usage</h1>
          <p className="text-sm text-white/50">Manage your direction lookups and payment history</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 lg:px-16 py-8 lg:py-12">
        {/* Balance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 -mt-16 relative z-10">
          {[
            { icon: 'account_balance_wallet', label: 'Total Uses', value: loading ? '...' : totalUses, color: 'bg-primary', sub: 'Available now' },
            { icon: 'redeem', label: 'Free Uses', value: loading ? '...' : wallet?.freeUsesRemaining ?? 0, color: 'bg-[#1E7E34]', sub: 'Included on signup' },
            { icon: 'paid', label: 'Paid Uses', value: loading ? '...' : wallet?.paidUsesRemaining ?? 0, color: 'bg-tertiary', sub: 'From purchases' },
            { icon: 'history', label: 'Directions Used', value: loading ? '...' : transactions.length, color: 'bg-secondary', sub: 'All time' },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 ring-1 ring-outline-variant/20 hover:ring-outline-variant/40 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center`}>
                  <Icon name={c.icon} size="text-[18px]" className="text-white" />
                </div>
                <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">{c.label}</span>
              </div>
              <p className="text-3xl font-bold text-on-surface">{c.value}</p>
              <p className="text-xs text-on-surface-variant mt-1">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Buy + How it works */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 ring-1 ring-outline-variant/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Icon name="add_shopping_cart" size="text-[18px]" className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-on-surface">Buy More Uses</h2>
                <p className="text-xs text-on-surface-variant">5 direction lookups</p>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4 mb-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-on-surface-variant">Package</span>
                <span className="text-sm font-semibold text-on-surface">5 uses</span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-sm text-on-surface-variant">Price</span>
                <span className="text-2xl font-bold text-primary">1,000 <span className="text-sm font-semibold">FCFA</span></span>
              </div>
            </div>
            <button onClick={handleBuy} disabled={buying}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {buying ? (
                <><Icon name="progress_activity" size="text-[18px]" className="animate-spin" /> Processing...</>
              ) : (
                <><Icon name="shopping_cart" size="text-[18px]" /> Buy Now</>
              )}
            </button>
          </div>

          <div className="lg:col-span-3 bg-[#0B1F3A] rounded-2xl p-6 lg:p-8 text-white">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Icon name="help_outline" size="text-[18px]" className="text-white" />
              </div>
              <h3 className="text-sm font-semibold">How It Works</h3>
            </div>
            <div className="space-y-4">
              {[
                { num: '1', text: 'Choose your package and payment method' },
                { num: '2', text: 'Complete the payment on your phone or via bank transfer' },
                { num: '3', text: 'An admin confirms and your uses are added instantly' },
                { num: '4', text: 'Use your credits to get directions to any mechanic workshop' },
              ].map((s) => (
                <div key={s.num} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">{s.num}</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed pt-1">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Icon name="receipt_long" size="text-[18px]" className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-on-surface">Recent Activity</h2>
                <p className="text-xs text-on-surface-variant">{transactions.length} transactions</p>
              </div>
            </div>
          </div>

          {recentTx.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center ring-1 ring-outline-variant/20">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center mx-auto mb-4">
                <Icon name="receipt_long" size="text-[28px]" className="text-on-surface-variant" />
              </div>
              <p className="text-sm font-semibold text-on-surface mb-1">No transactions yet</p>
              <p className="text-xs text-on-surface-variant">Your direction lookups will appear here</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl ring-1 ring-outline-variant/20 overflow-hidden">
              {recentTx.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.source === 'free' ? 'bg-[#E6F4EA]' : 'bg-primary/10'}`}>
                      <Icon name={t.type === 'directions' ? 'directions' : 'payment'} size="text-[18px]"
                        className={t.source === 'free' ? 'text-[#1E7E34]' : 'text-primary'} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">{t.type === 'directions' ? 'Directions Used' : t.type}</p>
                      <p className="text-xs text-on-surface-variant">{t.workshopName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      t.source === 'free' ? 'bg-[#E6F4EA] text-[#1E7E34]' : 'bg-primary/10 text-primary'
                    }`}>
                      {t.source}
                    </span>
                    <p className="text-[11px] text-on-surface-variant mt-1">{new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment History */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-tertiary flex items-center justify-center">
                <Icon name="payments" size="text-[18px]" className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-on-surface">Payment History</h2>
                <p className="text-xs text-on-surface-variant">{payments.length} payments</p>
              </div>
            </div>
          </div>

          {recentPayments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center ring-1 ring-outline-variant/20">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center mx-auto mb-4">
                <Icon name="payments" size="text-[28px]" className="text-on-surface-variant" />
              </div>
              <p className="text-sm font-semibold text-on-surface mb-1">No payments yet</p>
              <p className="text-xs text-on-surface-variant">Purchase a package to get started</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl ring-1 ring-outline-variant/20 overflow-hidden">
              {recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon name="account_balance_wallet" size="text-[18px]" className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">{p.amountFcfa.toLocaleString()} FCFA</p>
                      <p className="text-xs text-on-surface-variant capitalize">{p.provider.replace('_', ' ')} &middot; {p.usagesGranted} uses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      p.status === 'confirmed' ? 'bg-[#E6F4EA] text-[#1E7E34]' :
                      p.status === 'pending' ? 'bg-[#FFF3E0] text-[#E65100]' :
                      'bg-error-container/30 text-error'
                    }`}>
                      {p.status}
                    </span>
                    <p className="text-[11px] text-on-surface-variant mt-1">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={modal.open} onClose={() => setModal({ ...modal, open: false })} title={modal.title} message={modal.message} variant={modal.variant} />
    </main>
  );
}
