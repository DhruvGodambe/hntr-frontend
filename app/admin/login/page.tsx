"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, AdminApiError } from "@/lib/admin/api";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminApi.login(username.trim(), password);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = username.trim().length > 0 && password.length > 0 && !loading;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-8">
          <img src="/assets/images/logoMark.png" alt="HNTR" className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-gray-400 mt-2 text-sm">Enter username and password to access dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="admin-username" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              disabled={loading}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f50] transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f50] transition-colors disabled:opacity-50"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-[#f50] hover:bg-[#ff6600] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98]"
          >
            {loading ? "Authenticating..." : "Authenticate"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#222] text-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-white text-sm transition-colors"
          >
            ← Back to Application
          </button>
        </div>
      </div>
    </div>
  );
}
