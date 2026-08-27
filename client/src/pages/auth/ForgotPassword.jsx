import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
      setResetUrl(data.developmentResetUrl || '');
    } catch (error) {
      setMessage(error.response?.data?.message || 'We could not start password reset. Please try again.');
    }
  }

  return <main className="pt-20 min-h-screen bg-background flex items-center justify-center px-5"><div className="w-full max-w-md bg-white rounded-2xl border border-outline-variant/30 p-8 shadow-sm"><h1 className="text-2xl font-bold text-on-surface mb-2">Reset your password</h1><p className="text-sm text-on-surface-variant mb-6">Enter your account email to prepare a reset link.</p><form onSubmit={submit} className="space-y-4"><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full h-12 px-4 rounded-lg bg-surface border border-outline-variant/60 focus:border-primary focus:outline-none" /><button className="w-full h-12 rounded-lg bg-primary text-on-primary font-semibold">Reset password</button></form>{message && <p className="mt-5 text-sm text-on-surface-variant">{message}</p>}{resetUrl && <Link to={resetUrl.replace(window.location.origin, '')} className="mt-4 block text-sm font-semibold text-primary hover:underline">Continue to password reset</Link>}<Link to="/auth/signin" className="mt-6 block text-sm font-semibold text-primary hover:underline">Back to sign in</Link></div></main>;
}
