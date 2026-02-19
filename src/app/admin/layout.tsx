'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/admin/products',
    label: 'Tiles',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    href: '/admin/stock',
    label: 'Stock Log',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: '/admin/sub-admins',
    label: 'Sub Admins',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === '/admin/login') return <>{children}</>;

  const handleLogout = async () => {
    await fetch("/api/auth/admin-logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const currentPage = NAV_ITEMS.find((n) => n.href === pathname)?.label || 'Admin';

  return (
    <div className="min-h-screen bg-brand-black flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full w-64 bg-brand-black-2 border-r border-brand-border z-30
          transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-brand-border">
          <div
            className="w-9 h-9 rounded-xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center shrink-0"
            style={{ boxShadow: '0 0 15px rgba(124,58,237,0.2)' }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-brand-purple-light" fill="currentColor">
              <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-brand-text text-sm tracking-wide">TileHub</p>
            <p className="text-xs text-brand-muted">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider px-4 mb-3">
            Navigation
          </p>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-brand-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-brand-black-4 border border-brand-border">
            <div className="w-8 h-8 rounded-full bg-brand-purple/30 border border-brand-purple/40 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-brand-purple-light">SA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-text truncate">Super Admin</p>
              <p className="text-xs text-brand-muted">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-brand-muted hover:text-red-400 transition-colors p-1 rounded"
              title="Logout"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Topbar */}
        <header className="h-16 bg-brand-black-2 border-b border-brand-border flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-10">
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-brand-black-4 text-brand-muted hover:text-brand-text transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex-1">
            <h1 className="text-sm font-semibold text-brand-text">{currentPage}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="badge-purple hidden sm:inline-flex">Super Admin</span>
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 text-brand-muted hover:text-red-400 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-red-900/20"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
