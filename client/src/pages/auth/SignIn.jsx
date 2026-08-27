import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon';

export default function SignIn() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      navigate(user.role === 'mechanic' ? '/dashboard' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  }

  return (
    <main className="pt-20 min-h-screen flex">
      {/* Left visual panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-container-high overflow-hidden">
        <img src="/signin-hero.webp" alt="Professional mechanic workshop" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/95 via-[#0B1F3A]/60 to-transparent" />
        <div className="relative z-10 p-16 flex flex-col justify-end h-full w-full">
          <div className="max-w-md">
            <div className="mb-8 flex items-center gap-2">
              <Icon name="verified_user" className="text-primary-fixed text-[32px] opacity-80" />
              <span className="font-semibold text-primary-fixed tracking-widest uppercase text-sm">Verified Partners</span>
            </div>
            <h2 className="text-4xl font-bold text-on-primary mb-4 leading-tight">Expertise you can trust. Precision you demand.</h2>
            <p className="text-lg text-inverse-primary max-w-sm">
              Access Yaoundé's top-tier automotive professionals and manage your workshop with uncompromising efficiency.
            </p>
            <div className="mt-8 pt-4 border-t border-primary-fixed/20 flex items-center gap-3">
              <div className="flex -space-x-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-[#0B1F3A] flex items-center justify-center">
                    <Icon name="person" size="text-[16px]" className="text-on-surface-variant" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-primary-fixed/80"><span className="font-semibold text-on-primary">500+</span> workshops connected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-5 lg:p-16 relative bg-surface">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-fixed-dim/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl shadow-on-surface/5 p-8 relative border border-outline-variant/30">
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
              <Icon name="car_repair" className="text-white" size="text-[32px]" />
            </div>
            <h1 className="text-2xl font-semibold text-on-surface mb-2 tracking-tight">Welcome back</h1>
            <p className="text-base text-on-surface-variant max-w-[280px]">Sign in to manage your workshop or find a mechanic.</p>
          </div>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-container/30 text-error text-sm font-medium">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="font-semibold text-xs text-on-surface-variant uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="Enter your email"
                  className="w-full h-12 pl-10 pr-4 bg-surface rounded-lg text-base text-on-surface border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-outline/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs text-on-surface-variant uppercase tracking-wider block">Password</label>
                <Link to="/auth/forgot-password" className="font-semibold text-sm text-primary hover:text-primary-container transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <Icon name="lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full h-12 pl-10 pr-12 bg-surface rounded-lg text-base text-on-surface border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-outline/50"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                  <Icon name={showPw ? 'visibility' : 'visibility_off'} size="text-[20px]" />
                </button>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="submit" disabled={loading}
                className="w-full h-12 bg-primary text-on-primary rounded-lg font-semibold text-base hover:bg-primary-container active:scale-[0.98] transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : (<><span>Sign In</span><Icon name="arrow_forward" size="text-[20px]" /></>)}
              </button>
            </div>
          </form>
          <div className="mt-8 text-center border-t border-outline-variant/30 pt-4">
            <p className="text-sm text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/auth/register" className="font-semibold text-primary hover:text-primary-container transition-colors ml-1">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
