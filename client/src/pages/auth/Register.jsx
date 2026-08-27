import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'car_owner';

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (!agreed) { setError('You must agree to the terms.'); return; }
    try {
      await register({ name: form.name, email: form.email, password: form.password, phone: form.phone, role });
      navigate(role === 'mechanic' ? '/dashboard' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  }

  return (
    <main className="pt-20 min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] mix-blend-multiply pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-tertiary/5 rounded-full blur-[100px] mix-blend-multiply pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="max-w-[1280px] mx-auto px-5 lg:px-16 w-full py-8 relative z-10">
        <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Form */}
          <div className="w-full max-w-[480px] mx-auto lg:mx-0 order-2 lg:order-1">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-on-background tracking-tight mb-2">Create your account</h1>
              <p className="text-lg text-on-surface-variant">Enter your details to join the MecaFind network.</p>
            </div>
            {error && <div className="mb-4 p-3 rounded-lg bg-error-container/30 text-error text-sm font-medium">{error}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-xs text-on-surface uppercase tracking-wider">Full Name</label>
                <div className="flex items-center w-full bg-white rounded-lg h-12 px-4 shadow-[0_2px_8px_rgba(11,31,58,0.06)] ring-1 ring-outline-variant focus-within:ring-primary focus-within:ring-2">
                  <Icon name="person" className="text-outline mr-3" />
                  <input value={form.name} onChange={set('name')} required placeholder="Enter your name" className="w-full h-full bg-transparent text-base text-on-surface placeholder:text-outline focus:outline-none" />
                </div>
              </div>
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-xs text-on-surface uppercase tracking-wider">Email Address</label>
                <div className="flex items-center w-full bg-white rounded-lg h-12 px-4 shadow-[0_2px_8px_rgba(11,31,58,0.06)] ring-1 ring-outline-variant focus-within:ring-primary focus-within:ring-2">
                  <Icon name="mail" className="text-outline mr-3" />
                  <input type="email" value={form.email} onChange={set('email')} required placeholder="Enter your email" className="w-full h-full bg-transparent text-base text-on-surface placeholder:text-outline focus:outline-none" />
                </div>
              </div>
              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-xs text-on-surface uppercase tracking-wider">Phone Number</label>
                <div className="flex items-center w-full bg-white rounded-lg shadow-[0_2px_8px_rgba(11,31,58,0.06)] ring-1 ring-outline-variant focus-within:ring-primary focus-within:ring-2 overflow-hidden h-12">
                  <div className="flex items-center h-full bg-surface-container-low px-3 border-r border-outline-variant select-none">
                    <span className="text-xl leading-none mr-2">🇨🇲</span>
                    <span className="text-base text-on-surface-variant font-medium">+237</span>
                  </div>
                  <input type="tel" value={form.phone} onChange={set('phone')} required pattern="[0-9]{9}" placeholder="6XX XXX XXX" className="w-full h-full bg-transparent text-base text-on-surface placeholder:text-outline focus:outline-none px-4" />
                </div>
              </div>
              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-xs text-on-surface uppercase tracking-wider">Password</label>
                  <div className="flex items-center w-full bg-white rounded-lg h-12 px-4 shadow-[0_2px_8px_rgba(11,31,58,0.06)] ring-1 ring-outline-variant focus-within:ring-primary focus-within:ring-2">
                    <Icon name="lock" className="text-outline mr-3" />
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} required minLength={8} placeholder="••••••••" className="w-full h-full bg-transparent text-base text-on-surface placeholder:text-outline focus:outline-none" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="ml-2 text-outline hover:text-primary transition-colors flex items-center justify-center">
                      <Icon name={showPw ? 'visibility' : 'visibility_off'} size="text-[20px]" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-xs text-on-surface uppercase tracking-wider">Confirm Password</label>
                  <div className="flex items-center w-full bg-white rounded-lg h-12 px-4 shadow-[0_2px_8px_rgba(11,31,58,0.06)] ring-1 ring-outline-variant focus-within:ring-primary focus-within:ring-2">
                    <Icon name="lock_reset" className="text-outline mr-3" />
                    <input type={showPw ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} required placeholder="••••••••" className="w-full h-full bg-transparent text-base text-on-surface placeholder:text-outline focus:outline-none" />
                  </div>
                </div>
              </div>
              {/* Terms */}
              <div className="flex items-start gap-3 mt-2">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-white cursor-pointer accent-primary mt-0.5" />
                <label className="text-sm text-on-surface-variant cursor-pointer select-none">
                  I agree to the <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a> and <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>.
                </label>
              </div>
              {/* Submit */}
              <button type="submit" disabled={loading} className="mt-4 w-full h-12 bg-primary text-on-primary rounded-lg font-semibold text-base shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-primary-container transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                {!loading && <Icon name="arrow_forward" size="text-[20px]" />}
              </button>
              <div className="text-center mt-2">
                <span className="text-base text-on-surface-variant">Already have an account? </span>
                <Link to="/auth/signin" className="font-semibold text-base text-primary hover:text-primary-container hover:underline transition-colors">Sign In</Link>
              </div>
            </form>
          </div>
          {/* Visual panel */}
          <div className="hidden lg:flex relative w-full min-h-[600px] order-1 lg:order-2">
            <div className="absolute inset-0 bg-surface-container rounded-3xl overflow-hidden shadow-xl ring-1 ring-outline-variant">
              <img src={role === 'mechanic' ? '/workshop-1.webp' : '/hero-map.webp'} alt={role === 'mechanic' ? 'Professional mechanic workshop' : 'Find mechanics on the map'} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/80 via-transparent to-transparent" />
              <div className="absolute top-8 left-8 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <Icon name={role === 'mechanic' ? 'build' : 'directions_car'} className="text-white" size="text-[32px]" />
              </div>
              <div className="absolute bottom-12 right-12 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg ring-1 ring-outline-variant max-w-[240px] flex gap-3 transform -rotate-2">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                  <Icon name="verified" className="text-on-secondary-container" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-on-surface">
                    {role === 'mechanic' ? 'List Your Workshop' : 'Find Trusted Mechanics'}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {role === 'mechanic' ? 'Reach more customers in Yaoundé.' : 'Access top-rated professionals.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
