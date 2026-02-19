'use client';
import { useEffect, useState } from 'react';
import type { StockLog } from '@/types';

const TYPE_FILTERS = ['', 'ADD', 'REDUCE', 'SALE', 'ADJUSTMENT'];

export default function StockPage() {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch('/api/stock')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setLogs(d.data);
        setLoading(false);
      });
  }, []);

  const filtered = !filter ? logs : logs.filter((l) => l.type === filter);

  const typeBadge = (t: string) => {
    const map: Record<string, string> = {
      ADD: 'badge-green',
      SALE: 'badge-red',
      REDUCE: 'badge-yellow',
      ADJUSTMENT: 'badge-blue',
    };
    return map[t] || 'badge-blue';
  };

  const typeSign = (t: string) => (t === 'ADD' ? '+' : '-');
  const typeColor = (t: string) =>
    t === 'ADD' ? 'text-green-400' : t === 'SALE' ? 'text-red-400' : 'text-yellow-400';

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Log</h1>
          <p className="page-subtitle">Complete transaction history ({logs.length} records)</p>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 border ${
              filter === t
                ? 'bg-brand-purple border-brand-purple text-white shadow-purple-glow'
                : 'bg-brand-black-4 border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-border-light'
            }`}
          >
            {t || 'All'}{' '}
            <span className="ml-1 text-xs opacity-70">
              ({t ? logs.filter((l) => l.type === t).length : logs.length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden lg:block glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-brand-black-4">
                  <th className="table-header">Tile</th>
                  <th className="table-header">SKU</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Quantity</th>
                  <th className="table-header">Done By</th>
                  <th className="table-header">Note</th>
                  <th className="table-header">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-black-4/40 transition-colors">
                    <td className="table-cell font-medium">{log.tile?.name || '—'}</td>
                    <td className="table-cell">
                      <code className="text-xs text-brand-purple-light font-mono bg-brand-purple/10 px-2 py-0.5 rounded">
                        {log.tile?.sku || '—'}
                      </code>
                    </td>
                    <td className="table-cell">
                      <span className={typeBadge(log.type)}>{log.type}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`font-bold ${typeColor(log.type)}`}>
                        {typeSign(log.type)}
                        {log.quantity}
                      </span>
                      <span className="text-brand-muted text-xs ml-1">boxes</span>
                    </td>
                    <td className="table-cell text-brand-muted">{log.doneBy}</td>
                    <td className="table-cell text-brand-muted text-sm italic">
                      {log.note || '—'}
                    </td>
                    <td className="table-cell text-brand-muted text-xs">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-14 text-center">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-brand-muted">No transactions found</p>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="lg:hidden space-y-3">
            {filtered.map((log) => (
              <div key={log.id} className="glass-card p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-medium text-brand-text text-sm">{log.tile?.name || '—'}</p>
                    <code className="text-xs text-brand-purple-light font-mono">{log.tile?.sku}</code>
                  </div>
                  <span className={typeBadge(log.type)}>{log.type}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-brand-muted">Qty: </span>
                    <span className={`font-bold ${typeColor(log.type)}`}>
                      {typeSign(log.type)}{log.quantity} boxes
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-muted">By: </span>
                    <span className="text-brand-text">{log.doneBy}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-brand-muted">Date: </span>
                    <span className="text-brand-text">{new Date(log.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  {log.note && (
                    <div className="col-span-2">
                      <span className="text-brand-muted">Note: </span>
                      <span className="text-brand-text italic">{log.note}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-14 text-brand-muted">No transactions found</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
