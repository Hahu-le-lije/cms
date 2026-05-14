"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getContentPack, updateContentPack } from '@/lib/cmsApi';
import { getStoredAdminToken } from '@/lib/adminToken';

const EditPackPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const token = getStoredAdminToken();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game_type: 'flashcard',
    thumbnail_url: '',
    size_mb: '0',
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || !token) return;

    const loadPack = async () => {
      try {
        const pack = await getContentPack(id, token);
        setFormData({
          title: pack.title || '',
          description: pack.description || '',
          game_type: pack.game_type || 'flashcard',
          thumbnail_url: pack.thumbnail_url || '',
          size_mb: String(pack.size_mb || 0),
          is_active: pack.is_active ?? true,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load pack');
      } finally {
        setLoading(false);
      }
    };

    loadPack();
  }, [id, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const packData = {
        ...formData,
        size_mb: parseFloat(formData.size_mb) || 0,
      };

      await updateContentPack(id, packData, token);
      router.push('/packs');
    } catch (err: any) {
      setError(err.message || 'Failed to update pack');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-slate-500 font-medium animate-pulse">Fetching manifest...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 h-20 flex items-center">
        <div className="max-w-5xl mx-auto px-6 w-full flex justify-between items-center">
          <Link href="/packs" className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm uppercase tracking-widest">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Cancel Edits
          </Link>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-widest">Editing ID:</span>
            <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded">{id?.slice(0, 8)}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-2">
            <header className="mb-10">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Modify Pack</h1>
              <p className="text-slate-500 mt-2 font-medium">Update the properties and metadata for this distribution.</p>
            </header>

            {error && (
              <div className="mb-8 bg-red-50 border border-red-100 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold">!</div>
                <p className="text-red-800 text-sm font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm space-y-6">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Pack Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Summary</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all resize-none"
                  />
                </div>

                {/* Game Type & Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                    <select
                      name="game_type"
                      value={formData.game_type}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold appearance-none"
                    >
                      <option value="flashcard">Flashcards</option>
                      <option value="matching">Matching Game</option>
                      <option value="memory">Memory Challenge</option>
                      <option value="puzzle">Logic Puzzle</option>
                      <option value="vocabulary">Vocabulary Hub</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Payload Size (MB)</label>
                    <input
                      type="number"
                      name="size_mb"
                      step="0.1"
                      value={formData.size_mb}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold transition-all"
                    />
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Cover Image URL</label>
                  <input
                    type="url"
                    name="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium transition-all"
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-blue-900">Distribution Status</span>
                    <span className="text-xs text-blue-600">Active packs are visible to clients.</span>
                  </div>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-6 h-6 rounded-lg border-blue-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-black py-5 px-8 rounded-[2rem] transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    Commit Changes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Visual State */}
          <div className="hidden lg:block">
            <div className="sticky top-32">
              <div className="text-center mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Preview</span>
              </div>
              
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      ID: {id?.slice(0, 8)}
                    </div>
                    <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${formData.is_active ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-slate-50 text-slate-400 ring-1 ring-slate-100'}`}>
                      {formData.is_active ? 'Live' : 'Draft'}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3 truncate">
                    {formData.title || 'Untitled Pack'}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8 h-12 line-clamp-2">
                    {formData.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Genre</p>
                      <p className="text-slate-800 font-bold text-xs capitalize">{formData.game_type}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Payload</p>
                      <p className="text-slate-800 font-bold text-xs">{formData.size_mb || 0} MB</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-slate-100 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Saving changes will immediately update the manifest for all connected users. Ensure assets are uploaded before toggling to <strong>Live</strong>.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default EditPackPage;