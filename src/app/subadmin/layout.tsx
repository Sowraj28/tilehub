'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  {
    href: '/subadmin/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/subadmin/scan',
    label: 'Scan & Export',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <rect x="3" y="3" width="5" height="5" /><rect x="16" y="3" width="5" height="5" /><rect x="3" y="16" width="5" height="5" />
        <path d="M21 16h-3a2 2 0 00-2 2v3M21 21v-3a2 2 0 00-2-2h-3M3 11h3M11 3v3M3 8v3M8 3H5" />
      </svg>
    ),
  },
  {
    href: '/subadmin/exports',
    label: 'Export History',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

export default function SubAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === '/subadmin/login') return <>{children}</>;

  const logout = async () => {
      await fetch("/api/auth/subadmin-logout", { method: "POST" });
      router.push("/subadmin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-brand-black flex flex-col">
      {/* Header */}
      <header className="h-16 bg-brand-black-2 border-b border-brand-border flex items-center px-4 gap-4 sticky top-0 z-10">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-brand-purple-light" fill="currentColor">
              <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <p className="font-bold text-brand-text text-sm leading-none">TileHub</p>
            <p className="text-xs text-brand-muted leading-none mt-0.5">Sub Admin</p>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1 flex-1 ml-4">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                pathname === n.href
                  ? 'bg-brand-purple/20 text-brand-purple-light border border-brand-purple/30'
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-black-4'
              }`}
            >
              {n.icon}
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 sm:flex-none" />

        {/* Desktop logout */}
        <button
          onClick={logout}
          className="hidden sm:flex items-center gap-2 text-brand-muted hover:text-red-400 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-red-900/20"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden p-2 text-brand-muted hover:text-brand-text rounded-lg hover:bg-brand-black-4 transition-colors"
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden bg-brand-black-2 border-b border-brand-border px-4 py-3 space-y-1 z-10">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === n.href
                  ? 'bg-brand-purple/20 text-brand-purple-light'
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-black-4'
              }`}
            >
              {n.icon}
              {n.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2.5 text-red-400 text-sm w-full rounded-lg hover:bg-red-900/20 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
    </div>
  );
}
