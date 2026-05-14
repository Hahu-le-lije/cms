"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setStoredAdminToken } from '@/lib/adminToken';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json', // Critical for Laravel to return JSON errors
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Laravel typically returns { access_token: "...", token_type: "Bearer" }
      // Adjust 'access_token' if your Laravel controller uses a different key
      const token = data.access_token || data.token;

      if (token) {
        setStoredAdminToken(token);
        router.push('/packs');
        router.refresh(); // Ensure the layout detects the new token
      } else {
        throw new Error('Token not found in response');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl mb-4 flex items-center justify-center mx-auto ring-1 ring-blue-500/50">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
          <p className="text-slate-500 mt-2 font-medium">Identify yourself to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4 mb-1 block">Email Address</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-600 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4 mb-1 block">Security Phrase</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-600 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] mt-4"
          >
            {isLoading ? 'Verifying...' : 'Authorize Access'}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-xl text-center animate-shake">
              {error}
            </div>
          )}
        </form>
        
        <div className="mt-8 text-center">
          <div className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
            Secure Admin Session
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;