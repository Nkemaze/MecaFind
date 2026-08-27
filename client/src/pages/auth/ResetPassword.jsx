import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  async function submit(event) { event.preventDefault(); if (password !== confirm) return setMessage('Passwords do not match.'); try { const { data } = await api.post('/auth/reset-password', { token, password }); setMessage(data.message); } catch (error) { setMessage(error.response?.data?.message || 'Could not reset password.'); } }
  if (!token) return <main className="pt-20 min-h-screen flex items-center justify-center"><Link to="/auth/forgot-password" className="text-primary">Request a new password-reset link</Link></main>;
  return <main className="pt-20 min-h-screen bg-background flex items-center justify-center px-5"><div className="w-full max-w-md bg-white rounded-2xl border border-outline-variant/30 p-8 shadow-sm"><h1 className="text-2xl font-bold text-on-surface mb-6">Choose a new password</h1><form onSubmit={submit} className="space-y-4"><input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" className="w-full h-12 px-4 rounded-lg bg-surface border border-outline-variant/60 focus:border-primary focus:outline-none" /><input type="password" required minLength={8} value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Confirm new password" className="w-full h-12 px-4 rounded-lg bg-surface border border-outline-variant/60 focus:border-primary focus:outline-none" /><button className="w-full h-12 rounded-lg bg-primary text-on-primary font-semibold">Save new password</button></form>{message && <p className="mt-5 text-sm text-on-surface-variant">{message}</p>}<Link to="/auth/signin" className="mt-6 block text-sm font-semibold text-primary hover:underline">Sign in</Link></div></main>;
}
