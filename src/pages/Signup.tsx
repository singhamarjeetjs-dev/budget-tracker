/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Signup.tsx
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await signup(email, password);
      navigate('/', { replace: true });
    } catch (error: any) {
      setErr(error.message ?? 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-semibold mb-4">Create your account</h2>
      <p className="text-sm text-gray-500 mb-6">Sign up to keep your data secure and backed up in the cloud</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm block mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="you@domain.com"
            type="email"
            required
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            type="password"
            placeholder="Choose a password"
            required
          />
        </div>

        {err && <div className="text-sm text-red-500">{err}</div>}

        <div>
          <button type="submit" disabled={loading} className="w-full p-2 bg-indigo-600 text-white rounded">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </div>
      </form>

      <div className="text-sm text-gray-500 mt-4">
        Already have an account? <Link to="/login" className="text-indigo-600">Sign in</Link>
      </div>
    </AuthLayout>
  );
}
