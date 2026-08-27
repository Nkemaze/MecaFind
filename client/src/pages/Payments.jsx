import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Icon from '../components/Icon';
import Modal from '../components/Modal';

const providers = [
  { key: 'mtn_momo', label: 'MTN Mobile Money', sub: 'Pay with MTN MoMo', icon: 'phone_android', color: '#FFCC00' },
  { key: 'orange_money', label: 'Orange Money', sub: 'Pay with Orange Money', icon: 'smartphone', color: '#FF6600' },
  { key: 'manual', label: 'Manual Transfer', sub: 'Bank or cash transfer', icon: 'account_balance', color: '#4d5f7d' },
];

export default function Payments() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState('mtn_momo');
  const [buying, setBuying] = useState(false);
  const [modal, setModal] = useState({ open: false, title: '', message: '', variant: 'info' });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get('/usage/me').catch(() => ({ data: {} })),
      api.get('/usage/payments').catch(() => ({ data: { payments: [] } })),
    ]).then(([w, p]) => {
      setWallet(w.data);
      setPayments(p.data.payments || []);
    }).finally(() => setLoading(false));
  }, [user]);

  async function handleBuy() {
    setBuying(true);
    try {
      await api.post('/usage/payments/checkout', { provider: selectedProvider });
      const { data } = await api.get('/usage/payments');
      setPayments(data.payments || []);
      setModal({ open: true, title: 'Payment Created', message: 'An admin will confirm your purchase shortly.', variant: 'success' });
    } catch (err) {
      setModal({ open: true, title: 'Payment Failed', message: err.response?.data?.message || 'Failed to create payment.', variant: 'error' });
    } finally {
      setBuying(false);
    }
  }

  if (!user) return null;

  const totalUses = (wallet?.freeUsesRemaining ?? 0) + (wallet?.paidUsesRemaining ?? 0);

  return (
    <main className="pt-[72px] min-h-screen bg-surface">
      {/* Hero banner */}
      <div className="bg-[#0B1F3A] text-white">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-16 py-10 lg:py-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-inverse-primary/60 mb-2">Wallet</p>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Payments</h1>
          <p className="text-sm text-white/50">Top up your usage credits and view payment history</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 lg:px-16 py-8 lg:py-12">
        {/* Balance card */}
        <div className="bg-white rounded-2xl ring-1 ring-outline-variant/20 p-6 lg:p-8 mb-8 -mt-16 relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
              <Icon name="account_balance_wallet" className="text-white" size="text-[28px]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Current Balance</p>
              <p className="text-3xl font-bold text-on-surface">
                {loading ? '...' : totalUses} <span className="text-base font-semibold text-on-surface-variant">uses</span>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-[#E6F4EA]">
              <span className="text-[#1E7E34] font-bold text-lg">{wallet?.freeUsesRemaining ?? 0}</span>
              <span className="text-[#1E7E34] text-xs ml-1.5 font-medium">free</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-primary/10">
              <span className="text-primary font-bold text-lg">{wallet?.paidUsesRemaining ?? 0}</span>
              <span className="text-primary text-xs ml-1.5 font-medium">paid</span>
            </div>
          </div>
        </div>

        {/* Top Up + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
          {/* Provider selection */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 ring-1 ring-outline-variant/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Icon name="shopping_cart" size="text-[18px]" className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-on-surface">Top Up Usage</h2>
                <p className="text-xs text-on-surface-variant">5 direction lookups for 1,000 FCFA</p>
              </div>
            </div>

            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Payment Method</p>
            <div className="space-y-2.5 mb-6">
              {providers.map((p) => (
                <button key={p.key} onClick={() => setSelectedProvider(p.key)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left ring-1 ${
                    selectedProvider === p.key
                      ? 'ring-primary bg-primary/[0.03] ring-2'
                      : 'ring-outline-variant/20 hover:ring-outline-variant/40'
                  }`}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: p.color + '15' }}>
                    <Icon name={p.icon} size="text-[22px]" style={{ color: p.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface">{p.label}</p>
                    <p className="text-xs text-on-surface-variant">{p.sub}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    selectedProvider === p.key ? 'border-primary bg-primary' : 'border-outline-variant'
                  }`}>
                    {selectedProvider === p.key && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-3 mb-5">
              <span className="text-sm text-on-surface-variant">You pay</span>
              <span className="text-xl font-bold text-primary">1,000 <span className="text-sm font-semibold">FCFA</span></span>
            </div>

            <button onClick={handleBuy} disabled={buying}
              className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {buying ? (
                <><Icon name="progress_activity" size="text-[18px]" className="animate-spin" /> Processing...</>
              ) : (
                <><Icon name="shopping_cart" size="text-[18px]" /> Buy 5 Uses — 1,000 FCFA</>
              )}
            </button>
          </div>

          {/* How it works */}
          <div className="lg:col-span-2 bg-[#0B1F3A] rounded-2xl p-6 lg:p-8 text-white flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Icon name="info" size="text-[18px]" className="text-white" />
              </div>
              <h3 className="text-sm font-semibold">How It Works</h3>
            </div>
            <div className="space-y-4">
              {[
                { num: '1', text: 'Select your preferred payment provider' },
                { num: '2', text: 'Complete the payment on your phone' },
                { num: '3', text: 'An admin confirms and credits are added' },
                { num: '4', text: 'Use credits to get directions to workshops' },
              ].map((s) => (
                <div key={s.num} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">{s.num}</span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed pt-0.5">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-tertiary flex items-center justify-center">
                <Icon name="receipt_long" size="text-[18px]" className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-on-surface">Payment History</h2>
                <p className="text-xs text-on-surface-variant">{payments.length} payments</p>
              </div>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center ring-1 ring-outline-variant/20">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center mx-auto mb-4">
                <Icon name="receipt_long" size="text-[28px]" className="text-on-surface-variant" />
              </div>
              <p className="text-sm font-semibold text-on-surface mb-1">No payments yet</p>
              <p className="text-xs text-on-surface-variant">Purchase a package to get started</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl ring-1 ring-outline-variant/20 overflow-hidden">
              {payments.map((p) => (
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
