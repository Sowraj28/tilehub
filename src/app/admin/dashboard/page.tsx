'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Tile, StockLog } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboard() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/tiles').then((r) => r.json()),
      fetch('/api/stock').then((r) => r.json()),
    ]).then(([t, l]) => {
      if (t.success) setTiles(t.data);
      if (l.success) setLogs(l.data);
      setLoading(false);
    });
  }, []);

  const totalStock = tiles.reduce((a, t) => a + t.stockQty, 0);
  const stockValue = tiles.reduce((a, t) => a + t.stockQty * t.pricePerBox, 0);
  const lowStockTiles = tiles.filter((t) => t.stockQty <= t.minStock);
  const categories = new Set(tiles.map((t) => t.category)).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your tile inventory</p>
        </div>
        <Link href="/admin/products" className="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Tile
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tile Models', value: tiles.length, icon: '📦', color: 'text-brand-purple-light' },
          { label: 'Total Stock (Boxes)', value: totalStock.toLocaleString(), icon: '🏗️', color: 'text-blue-400' },
          { label: 'Stock Value', value: formatCurrency(stockValue), icon: '💰', color: 'text-green-400' },
          {
            label: 'Low Stock Alerts',
            value: lowStockTiles.length,
            icon: '⚠️',
            color: lowStockTiles.length > 0 ? 'text-red-400' : 'text-green-400',
          },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <span className="text-2xl">{s.icon}</span>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-brand-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
            <h2 className="font-semibold text-brand-text">⚠️ Low Stock Tiles</h2>
            <span className="badge-red">{lowStockTiles.length} alerts</span>
          </div>
          <div className="divide-y divide-brand-border/50">
            {lowStockTiles.slice(0, 6).map((tile) => (
              <div
                key={tile.id}
                className="px-5 py-3 flex items-center justify-between hover:bg-brand-black-4/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-brand-text">{tile.name}</p>
                  <p className="text-xs text-brand-muted">{tile.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-400">{tile.stockQty} boxes</p>
                  <p className="text-xs text-brand-muted">Min: {tile.minStock}</p>
                </div>
              </div>
            ))}
            {lowStockTiles.length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="text-4xl mb-2">✅</p>
                <p className="text-brand-muted text-sm">All tiles are well stocked</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border">
            <h2 className="font-semibold text-brand-text">📋 Recent Stock Activity</h2>
          </div>
          <div className="divide-y divide-brand-border/50">
            {logs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="px-5 py-3 flex items-center justify-between hover:bg-brand-black-4/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-brand-text">{log.tile?.name || 'Unknown'}</p>
                  <p className="text-xs text-brand-muted">
                    {log.doneBy} · {new Date(log.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`badge text-xs ${
                      log.type === 'ADD'
                        ? 'badge-green'
                        : log.type === 'SALE'
                        ? 'badge-red'
                        : log.type === 'REDUCE'
                        ? 'badge-yellow'
                        : 'badge-blue'
                    }`}
                  >
                    {log.type === 'ADD' ? '+' : '-'}
                    {log.quantity}
                  </span>
                  <p className="text-xs text-brand-muted mt-0.5">{log.type}</p>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-center text-brand-muted py-10 text-sm">No stock activity yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {tiles.length > 0 && (
        <div className="glass-card p-5">
          <h2 className="font-semibold text-brand-text mb-4">📊 Stock by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {Array.from(new Set(tiles.map((t) => t.category))).map((cat) => {
              const catTiles = tiles.filter((t) => t.category === cat);
              const catStock = catTiles.reduce((a, t) => a + t.stockQty, 0);
              return (
                <div key={cat} className="bg-brand-black-4 rounded-lg p-3 border border-brand-border hover:border-brand-purple/40 transition-colors">
                  <p className="text-xs text-brand-muted uppercase font-semibold tracking-wider truncate">
                    {cat}
                  </p>
                  <p className="text-xl font-bold text-brand-purple-light mt-1">{catTiles.length}</p>
                  <p className="text-xs text-brand-muted">{catStock.toLocaleString()} boxes</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tiles.length === 0 && (
        <div className="glass-card p-12 text-center">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-xl font-semibold text-brand-text mb-2">No tiles yet</p>
          <p className="text-brand-muted mb-6">Start by adding your first tile to the inventory</p>
          <Link href="/admin/products" className="btn-primary inline-flex">
            Add Your First Tile
          </Link>
        </div>
      )}
    </div>
  );
}
