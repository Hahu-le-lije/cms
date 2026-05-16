"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  listContentPacks,
  deleteContentPack,
} from "@/lib/cmsApi";
import {
  getStoredAdminToken,
  setStoredAdminToken,
} from "@/lib/adminToken";

const PacksList = () => {
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [tokenReady, setTokenReady] = useState(false);
  const [deleting, setDeleting] = useState<
    string | number | null
  >(null);

  useEffect(() => {
    const storedToken = getStoredAdminToken();

    if (storedToken) {
      setToken(storedToken);
    }

    setTokenReady(true);
  }, []);

  useEffect(() => {
    if (!tokenReady || !token) return;

    loadPacks(token);
  }, [token, tokenReady]);

  const loadPacks = async (currentToken: string) => {
    try {
      setLoading(true);
      setError("");

      const data = await listContentPacks(currentToken);

      // Laravel may return array directly
      setPacks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message || "Failed to load content packs"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTokenChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    setToken(value);
    setStoredAdminToken(value);
  };

  const handleDelete = async (
    id: string | number
  ) => {
    const confirmed = window.confirm(
      "This will permanently remove the content pack. Continue?"
    );

    if (!confirmed) return;

    try {
      setDeleting(id);

      await deleteContentPack(String(id), token);

      setPacks((prev) =>
        prev.filter(
          (pack) =>
            String(pack.id) !== String(id)
        )
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message || "Failed to delete pack"
      );
    } finally {
      setDeleting(null);
    }
  };

  if (!tokenReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">
            Loading Session...
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl mb-6 flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Admin Authorization
          </h1>

          <p className="text-slate-400 mb-8 text-sm">
            Enter your Laravel Sanctum bearer token.
          </p>

          <input
            type="password"
            className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500 transition-all mb-6"
            placeholder="Paste token..."
            value={token}
            onChange={handleTokenChange}
          />

          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Secure Session
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7"
                />
              </svg>
            </div>

            <div>
              <span className="font-black text-slate-900 tracking-tighter text-xl">
                CMS
              </span>

              <span className="ml-2 text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-wider">
                Admin
              </span>
            </div>
          </div>

          <Link href="/packs/create">
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-3 rounded-2xl transition-all flex items-center gap-2">
              <span>Create Pack</span>

              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </Link>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 mt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Content Packs
            </h1>

            <p className="text-slate-500 mt-2 font-medium">
              Manage your Laravel CMS content packs.
            </p>
          </div>

          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 shadow-sm">
            Total:
            <span className="text-blue-600 ml-1">
              {packs.length}
            </span>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-100 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              !
            </div>

            <p className="text-red-800 text-sm font-semibold flex-1">
              {error}
            </p>

            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-[280px] bg-white border border-slate-100 rounded-3xl animate-pulse p-6"
              />
            ))}
          </div>
        ) : packs.length === 0 ? (
          <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-4xl">
              📂
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No Content Packs
            </h3>

            <p className="text-slate-500 mb-10 max-w-sm font-medium">
              Create your first Laravel CMS content pack.
            </p>

            <Link href="/packs/create">
              <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-10 py-4 rounded-2xl transition-all">
                Create Pack
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {packs.map((pack) => (
              <div
                key={pack.id}
                className="group bg-white rounded-3xl border border-slate-200 hover:border-blue-400 transition-all duration-300 flex flex-col overflow-hidden"
              >
                <div className="p-8 flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      ID:
                      {String(pack.id).slice(0, 8)}
                    </div>

                    <div
                      className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        pack.is_active
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      {pack.is_active
                        ? "Live"
                        : "Draft"}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {pack.title}
                  </h3>

                  <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                    {pack.description ||
                      "No description provided."}
                  </p>

                  <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Type
                      </p>

                      <p className="text-slate-800 font-bold text-xs">
                        {pack.game_type || "General"}
                      </p>
                    </div>

                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Size
                      </p>

                      <p className="text-slate-800 font-bold text-xs">
                        {pack.size_mb || 0} MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-5 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Link href={`/packs/${pack.id}/edit`}>
                      <button className="w-10 h-10 flex items-center justify-center bg-slate-900 text-white border border-slate-800 rounded-xl hover:bg-slate-800 transition">
                        ✎
                      </button>
                    </Link>

                    <Link href={`/packs/${pack.id}/versions`}>
                     <button className="w-10 h-10 flex items-center justify-center bg-slate-900 text-white border border-slate-800 rounded-xl hover:bg-slate-800 transition">
                        ⎘
                      </button>
                    </Link>
                  </div>

                  <button
                    onClick={() => handleDelete(pack.id)}
                    disabled={deleting === pack.id}
                    className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest disabled:opacity-50"
                  >
                    {deleting === pack.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PacksList;