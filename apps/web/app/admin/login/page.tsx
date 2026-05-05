"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.adminLogin(email, password);
      router.push("/admin/shops/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-white/10">
        <h1 className="text-2xl font-black text-amber-500 mb-1 tracking-tight">
          Platform admin
        </h1>
        <p className="text-sm text-zinc-400 mb-8">
          Sign in to onboard shops and assign managers.
        </p>

        {error && (
          <div className="bg-red-500/15 border border-red-500/40 text-red-200 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
              placeholder="admin@bonum.coffee"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-xs text-zinc-500 text-center leading-relaxed">
          If login fails with “Invalid credentials”, production D1 often has no admin user yet.
          Deploy the latest API, then run once locally with your Worker{" "}
          <span className="font-mono text-zinc-400">JWT_SECRET</span> as{" "}
          <span className="font-mono text-zinc-400">secret</span>:
        </p>
        <pre className="mt-3 p-3 rounded-lg bg-black/50 border border-white/10 text-[10px] text-zinc-400 overflow-x-auto text-left whitespace-pre-wrap">
{`curl -X POST https://coffee-api.osohoo691016.workers.dev/v1/auth/bootstrap-admin \\
  -H "Content-Type: application/json" \\
  -d '{"secret":"YOUR_JWT_SECRET"}'`}
        </pre>
        <p className="mt-4 text-xs text-zinc-500 text-center">
          Then use{" "}
          <span className="text-zinc-400 font-mono">admin@bonum.coffee</span> /{" "}
          <span className="text-zinc-400 font-mono">admin123</span> unless you overrode them in
          the JSON.
        </p>

        <Link
          href="/"
          className="block mt-6 text-center text-sm text-zinc-500 hover:text-white"
        >
          ← Back to customer app
        </Link>
      </div>
    </div>
  );
}
