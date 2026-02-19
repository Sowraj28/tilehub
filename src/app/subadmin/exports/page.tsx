'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Export, Tile } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function ExportsPage() {
  const [exports, setExports] = useState<Export[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/exports')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setExports(d.data);
        setLoading(false);
      });
  }, []);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => (prev === id ? null : id));

  const downloadPDF = async (exp: Export) => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setFillColor(28, 28, 40);
    doc.rect(0, 0, 210, 45, 'F');

    doc.setTextColor(167, 139, 250);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('TILEHUB', 15, 20);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(136, 136, 168);
    doc.text('Export / Dispatch Bill — Reprint', 15, 28);

    doc.setTextColor(226, 226, 240);
    doc.setFontSize(8);
    doc.text(`Export ID: #${exp.id.slice(0, 12).toUpperCase()}`, 130, 18);
    doc.text(`Date: ${new Date(exp.createdAt).toLocaleString('en-IN')}`, 130, 24);
    doc.text(`By: ${exp.subAdmin?.displayName || 'Sub Admin'}`, 130, 30);

    doc.setDrawColor(45, 45, 58);
    doc.line(15, 47, 195, 47);

    const rows = exp.items.map((item, i) => [
      String(i + 1),
      item.tile?.name || '—',
      item.tile?.sku || '—',
      item.tile?.size ? `${item.tile.size} cm` : '—',
      item.tile?.finish || '—',
      String(item.quantity),
      `Rs. ${item.price.toLocaleString('en-IN')}`,
      `Rs. ${(item.quantity * item.price).toLocaleString('en-IN')}`,
    ]);

    autoTable(doc, {
      head: [['#', 'Tile Name', 'SKU', 'Size', 'Finish', 'Qty', 'Rate', 'Total']],
      body: rows,
      startY: 52,
      margin: { left: 15, right: 15 },
      styles: { fillColor: [24, 24, 31], textColor: [226, 226, 240], fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [92, 33, 182], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [30, 30, 40] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        5: { halign: 'center' },
        6: { halign: 'right' },
        7: { halign: 'right', fontStyle: 'bold' },
      },
    });

    const finalY =
      (doc as typeof jsPDF.prototype & { lastAutoTable: { finalY: number } })
        .lastAutoTable.finalY + 8;
    doc.setFillColor(20, 20, 30);
    doc.setDrawColor(92, 33, 182);
    doc.roundedRect(15, finalY, 180, 28, 3, 3, 'FD');

    doc.setTextColor(167, 139, 250);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Boxes: ${exp.totalBoxes}`, 25, finalY + 11);
    doc.text(`Total Value: Rs. ${exp.totalValue.toLocaleString('en-IN')}`, 25, finalY + 20);

    doc.setFontSize(7);
    doc.setTextColor(100, 100, 120);
    doc.line(15, 282, 195, 282);
    doc.text('This is a computer-generated document. — TileHub Enterprise System', 15, 286);

    doc.save(`TileHub_Export_${exp.id.slice(0, 8).toUpperCase()}_Reprint.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Export History</h1>
          <p className="page-subtitle">{exports.length} exports total</p>
        </div>
        <Link href="/subadmin/scan" className="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Export
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : exports.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-5xl mb-4">📄</p>
          <p className="text-xl font-semibold text-brand-text mb-2">No exports yet</p>
          <p className="text-brand-muted mb-6">
            Scan tile QR codes and create your first export bill
          </p>
          <Link href="/subadmin/scan" className="btn-primary inline-flex">
            Go to Scanner
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {exports.map((exp) => (
            <div key={exp.id} className="glass-card overflow-hidden">
              {/* Summary row */}
              <div
                onClick={() => toggleExpand(exp.id)}
                className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-brand-black-4/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-purple-light font-bold text-sm shrink-0">
                  {exp.items.length}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-text">
                    Export #{exp.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-brand-muted mt-0.5">
                    {new Date(exp.createdAt).toLocaleString('en-IN')} · {exp.totalBoxes} boxes ·{' '}
                    {exp.items.length} tile types
                  </p>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="font-bold text-green-400">{formatCurrency(exp.totalValue)}</p>
                  {exp.note && (
                    <p className="text-xs text-brand-muted italic truncate max-w-32">{exp.note}</p>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); downloadPDF(exp); }}
                  className="btn-secondary text-xs px-3 py-1.5 shrink-0 hidden sm:flex"
                  title="Download PDF"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  PDF
                </button>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`w-4 h-4 text-brand-muted transition-transform shrink-0 ${expanded === exp.id ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* Expanded detail */}
              {expanded === exp.id && (
                <div className="border-t border-brand-border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-brand-black-4">
                          <th className="table-header">#</th>
                          <th className="table-header">Tile Name</th>
                          <th className="table-header">SKU</th>
                          <th className="table-header hidden sm:table-cell">Size</th>
                          <th className="table-header hidden sm:table-cell">Finish</th>
                          <th className="table-header">Qty</th>
                          <th className="table-header">Rate</th>
                          <th className="table-header">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exp.items.map((item, i) => (
                          <tr key={item.id} className="hover:bg-brand-black-4/30">
                            <td className="table-cell text-brand-muted text-xs text-center">{i + 1}</td>
                            <td className="table-cell font-medium text-sm">{item.tile?.name || '—'}</td>
                            <td className="table-cell">
                              <code className="text-xs text-brand-purple-light font-mono">
                                {item.tile?.sku || '—'}
                              </code>
                            </td>
                            <td className="table-cell text-brand-muted text-sm hidden sm:table-cell">
                              {item.tile?.size}
                            </td>
                            <td className="table-cell text-brand-muted text-sm hidden sm:table-cell">
                              {item.tile?.finish}
                            </td>
                            <td className="table-cell font-semibold text-center">{item.quantity}</td>
                            <td className="table-cell text-brand-muted text-sm text-right">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="table-cell text-green-400 font-semibold text-right">
                              {formatCurrency(item.quantity * item.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-4 bg-brand-black-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-brand-text">
                        Total:{' '}
                        <span className="text-green-400">{formatCurrency(exp.totalValue)}</span>
                      </p>
                      <p className="text-xs text-brand-muted">{exp.totalBoxes} boxes</p>
                      {exp.note && (
                        <p className="text-xs text-brand-muted italic mt-1">Note: {exp.note}</p>
                      )}
                    </div>
                    <button
                      onClick={() => downloadPDF(exp)}
                      className="btn-primary text-sm"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
