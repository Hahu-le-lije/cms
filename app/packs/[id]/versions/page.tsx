"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createVersion, deleteVersion, listVersions } from '@/lib/cmsApi';
import { getStoredAdminToken } from '@/lib/adminToken';

const ManageVersionsPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const token = getStoredAdminToken();

  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const [form, setForm] = useState({
    version: '',
    payload: '{}',
    checksum: '',
    size_bytes: '',
    min_app_version: '',
    published_at: '',
  });

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [router, token]);

  useEffect(() => {
    if (!id || !token) return;
    loadVersions();
  }, [id, token]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const all = await listVersions(token, Number(id));
      setVersions(Array.isArray(all) ? all : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = form.payload.trim() ? JSON.parse(form.payload) : {};
      
      await createVersion(
        {
          content_pack_id: id,
          version: form.version,
          payload,
          checksum: form.checksum,
          size_bytes: form.size_bytes ? Number(form.size_bytes) : 0,
          min_app_version: form.min_app_version || '',
          published_at: form.published_at || null,
        },
        token,
      );

      setForm({
        version: '',
        payload: '{}',
        checksum: '',
        size_bytes: '',
        min_app_version: '',
        published_at: '',
      });

      await loadVersions();
    } catch (err: any) {
      setError(err instanceof SyntaxError ? 'Payload must be valid JSON' : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (versionId: string) => {
    if (!confirm('Permanently delete this version? This action cannot be undone.')) return;
    
    try {
      setDeleting(versionId);
      await deleteVersion(versionId, token);
      setVersions(prev => prev.filter(v => String(v.id) !== String(versionId)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Sequencing Versions...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <Link href="/packs" className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-black text-[10px] uppercase tracking-[0.2em]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            Registry
          </Link>
          <div className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-mono text-slate-500">
            CID: {id}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Version Control</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage deployment cycles and data payloads for this pack.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Version Ledger */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Ledger</h2>
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">{versions.length}</span>
            </div>

            {versions.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-12 text-center">
                <p className="text-slate-400 font-bold text-sm tracking-tight">No versions deployed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map(v => (
                  <div key={v.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-black text-slate-900">v{v.version}</span>
                          {v.published_at && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          )}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                          Min App: {v.min_app_version || 'Any'} • {v.size_bytes ? (v.size_bytes / 1024).toFixed(1) : 0} KB
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(v.id)}
                        disabled={deleting === v.id}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all hover:bg-red-50 rounded-xl"
                      >
                        {deleting === v.id ? '...' : '🗑️'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Creation Form */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-8">Deploy New Version</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Version String</label>
                  <input
                    name="version"
                    required
                    placeholder="e.g. 1.0.4"
                    value={form.version}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Min. App Support</label>
                  <input
                    name="min_app_version"
                    placeholder="e.g. 2.0.0"
                    value={form.min_app_version}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">JSON Payload</label>
                <textarea
                  name="payload"
                  required
                  rows={8}
                  value={form.payload}
                  onChange={handleChange}
                  className="w-full px-6 py-5 bg-slate-900 text-emerald-400 font-mono text-sm rounded-[2rem] focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Checksum (SHA256)</label>
                  <input
                    name="checksum"
                    value={form.checksum}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Size (Bytes)</label>
                  <input
                    name="size_bytes"
                    type="number"
                    value={form.size_bytes}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3">
                  <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-[10px]">!</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-black py-5 px-8 rounded-[2rem] transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Authorize & Deploy
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ManageVersionsPage;