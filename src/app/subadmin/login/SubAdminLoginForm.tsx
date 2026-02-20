"use client";
import { useState } from "react";

export default function SubAdminLogin() {
  const [form, setForm] = useState({ username: "", passKey: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const r = await fetch("/api/auth/subadmin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const d = await r.json();

      if (d.success) {
        setTimeout(() => {
          window.location.href = "/subadmin/dashboard";
        }, 100);
      } else {
        setError(d.error || "Login failed");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#7C3AED 1px,transparent 1px),linear-gradient(90deg,#7C3AED 1px,transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-purple/20 border border-brand-purple/30 mb-4"
            style={{ boxShadow: "0 0 40px rgba(124,58,237,0.3)" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-8 h-8 text-brand-purple-light"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-brand-text tracking-tight">
            TileHub
          </h1>
          <p className="text-brand-muted text-sm mt-1">Sub Admin Portal</p>
        </div>

        <div
          className="glass-card p-8"
          style={{
            boxShadow:
              "0 0 60px rgba(0,0,0,0.5), 0 0 30px rgba(124,58,237,0.08)",
          }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-brand-text">
              Sub Admin Sign In
            </h2>
            <p className="text-brand-muted text-sm mt-1">
              Use your credentials to access the stock portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) =>
                  setForm((p) => ({ ...p, username: e.target.value }))
                }
                className="input-field"
                placeholder="Your username"
                required
                autoFocus
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1.5">
                Pass Key
              </label>
              <input
                type="password"
                value={form.passKey}
                onChange={(e) =>
                  setForm((p) => ({ ...p, passKey: e.target.value }))
                }
                className="input-field"
                placeholder="Your pass key"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-800/50 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4 shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full justify-center py-3 text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-5 h-5"
                  >
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                  </svg>
                  Access Portal
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-brand-border text-center">
            <p className="text-brand-muted text-sm">
              Admin?{" "}
              <a
                href="/admin/login"
                className="text-brand-purple-light hover:text-white transition-colors font-medium"
              >
                Sign in here →
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-brand-muted text-xs mt-6">
          TileHub Enterprise © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
