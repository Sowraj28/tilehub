"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Tile } from "@/types";
import { formatCurrency } from "@/lib/utils";

// ── Tile Image Cell ───────────────────────────────────────────────────────────
function TileImageCell({ tile, onClick }: { tile: Tile; onClick: () => void }) {
  const [errored, setErrored] = useState(false);

  if (!tile.imageUrl || errored) {
    return (
      <div
        className="w-10 h-10 rounded-lg border border-dashed border-brand-border flex items-center justify-center shrink-0"
        title="No image"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-4 h-4 text-brand-muted"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title="View tile image"
      className="block w-10 h-10 rounded-lg overflow-hidden border border-brand-border hover:border-brand-purple/60 hover:shadow-lg hover:shadow-brand-purple/20 transition-all shrink-0 cursor-pointer"
    >
      <img
        src={tile.imageUrl}
        alt={tile.name}
        className="w-full h-full object-cover"
        onError={() => setErrored(true)}
      />
    </button>
  );
}

// ── Image Popup ───────────────────────────────────────────────────────────────
function ImagePopup({
  tile,
  onClose,
  onExportPDF,
}: {
  tile: Tile;
  onClose: () => void;
  onExportPDF: () => void;
}) {
  const [errored, setErrored] = useState(false);

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-lg"
        style={{ boxShadow: "0 0 80px rgba(124,58,237,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
          <div>
            <h2 className="font-semibold text-brand-text">{tile.name}</h2>
            <code className="text-xs text-brand-purple-light font-mono">
              {tile.sku}
            </code>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-black-4 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <div
            className="rounded-xl overflow-hidden border border-brand-border bg-brand-black"
            style={{ maxHeight: 420 }}
          >
            {errored ? (
              <div className="flex flex-col items-center justify-center h-48 text-brand-muted gap-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-10 h-10 opacity-40"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="text-sm">Could not load image</p>
                {tile.imageUrl && (
                  <a
                    href={tile.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-purple-light hover:underline break-all px-4 text-center"
                  >
                    {tile.imageUrl}
                  </a>
                )}
              </div>
            ) : (
              <img
                src={tile.imageUrl!}
                alt={tile.name}
                className="w-full object-contain"
                style={{ maxHeight: 420 }}
                onError={() => setErrored(true)}
              />
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-brand-muted justify-center">
            <span className="badge-blue">{tile.category}</span>
            <span>
              {tile.size} cm · {tile.finish} · {tile.color}
            </span>
            <span
              className={`font-bold ${tile.stockQty <= tile.minStock ? "text-red-400" : "text-green-400"}`}
            >
              {tile.stockQty} boxes in stock
            </span>
          </div>
          <div className="flex gap-3 mt-4 justify-center">
            <button
              onClick={() => {
                onClose();
                onExportPDF();
              }}
              className="btn-secondary text-sm"
            >
              Export PDF
            </button>
            <button onClick={onClose} className="btn-secondary text-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubAdminDashboard() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [qrTile, setQrTile] = useState<Tile | null>(null);
  const [imgTile, setImgTile] = useState<Tile | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tiles")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTiles(d.data);
        setLoading(false);
      });
  }, []);

  const categories = Array.from(new Set(tiles.map((t) => t.category)));

  const filtered = tiles.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.sku.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q);
    const matchCat = !filterCat || t.category === filterCat;
    return matchSearch && matchCat;
  });

  const downloadQR = (tile: Tile) => {
    if (!tile.qrCode) return;
    const a = document.createElement("a");
    a.href = tile.qrCode;
    a.download = `QR_${tile.sku}.png`;
    a.click();
  };

  const exportProductPDF = (tile: Tile) => {
    setExportingId(tile.id);

    const stockStatus =
      tile.stockQty === 0
        ? { label: "Out of Stock", color: "#ef4444" }
        : tile.stockQty <= tile.minStock
          ? { label: "Low Stock", color: "#eab308" }
          : { label: "In Stock", color: "#22c55e" };

    const thickness = tile.thickness ?? "N/A";

    // White-background QR in PDF so it never merges with dark backgrounds
    const qrSection = tile.qrCode
      ? `<div class="qr-box">
           <div style="background:#ffffff;padding:10px;border-radius:8px;display:inline-block;border:1px solid #e5e7eb;">
             <img src="${tile.qrCode}" alt="QR Code" class="qr-img" />
           </div>
           <p class="qr-label">Scan to identify product</p>
         </div>`
      : `<div class="qr-box no-qr"><p>No QR Code</p></div>`;

    const tileImageSection = tile.imageUrl
      ? `<div class="tile-img-section">
          <div class="spec-section-title" style="margin-bottom:10px">Tile Image</div>
          <div class="tile-img-wrap">
            <img src="${tile.imageUrl}" alt="${tile.name}" class="tile-img"
              onerror="this.parentElement.innerHTML='<p style=color:#aaa;text-align:center;padding:20px>Image unavailable</p>'" />
          </div>
         </div>`
      : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Product Detail — ${tile.sku}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #111; padding: 40px; max-width: 820px; margin: 0 auto; }
    .action-bar { display: flex; gap: 12px; margin-bottom: 28px; padding: 16px; background: #f9f5ff; border: 1px solid #e9d5ff; border-radius: 12px; align-items: center; }
    .action-bar p { flex: 1; font-size: 13px; color: #666; }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
    .btn-purple { background: #7C3AED; color: white; }
    .btn-outline { background: white; color: #7C3AED; border: 1.5px solid #7C3AED; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #7C3AED; padding-bottom: 18px; margin-bottom: 28px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon { width: 44px; height: 44px; background: #7C3AED; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .brand-icon svg { width: 24px; height: 24px; fill: white; }
    .brand-name { font-size: 22px; font-weight: 800; color: #7C3AED; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; color: #888; margin-top: 2px; }
    .doc-meta { text-align: right; }
    .doc-meta p { font-size: 11px; color: #888; }
    .doc-meta .sku-badge { font-size: 13px; font-weight: 700; color: #7C3AED; font-family: monospace; background: #f3eeff; padding: 4px 10px; border-radius: 6px; display: inline-block; margin-bottom: 4px; }
    .product-title { font-size: 26px; font-weight: 800; color: #111; margin-bottom: 6px; }
    .product-sub { font-size: 13px; color: #666; margin-bottom: 22px; }
    .stock-row { display: flex; gap: 10px; margin-bottom: 22px; }
    .stock-box { flex: 1; border-radius: 10px; padding: 14px 16px; border: 1px solid #e5e7eb; }
    .stock-box.qty { background: #f0fdf4; border-color: #bbf7d0; }
    .stock-box.price { background: #fefce8; border-color: #fef08a; }
    .stock-box .slabel { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .stock-box .svalue { font-size: 20px; font-weight: 800; }
    .tile-img-section { margin-bottom: 22px; }
    .tile-img-wrap { border: 2px solid #e9d5ff; border-radius: 14px; overflow: hidden; background: #faf5ff; }
    .tile-img { width: 100%; max-height: 280px; object-fit: cover; display: block; }
    .content-row { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 22px; }
    .specs { flex: 1; }
    .spec-section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #7C3AED; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #e9d5ff; }
    .spec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .spec-item { background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 10px 12px; }
    .spec-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
    .spec-value { font-size: 14px; font-weight: 600; color: #111; }
    /* QR box — white background so it's always scannable when printed */
    .qr-box { width: 185px; flex-shrink: 0; border: 2px solid #e5e7eb; border-radius: 14px; padding: 12px; text-align: center; background: #ffffff; }
    .qr-img { width: 137px; height: 137px; border-radius: 4px; display: block; margin: 0 auto; }
    .qr-label { font-size: 10px; color: #888; margin-top: 8px; }
    .no-qr { width: 185px; height: 185px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #aaa; }
    .desc-box { background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 12px 16px; margin-bottom: 22px; }
    .desc-box p { font-size: 13px; color: #444; line-height: 1.6; }
    .footer { border-top: 1px solid #eee; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; }
    .footer p { font-size: 10px; color: #bbb; }
    @media print {
      .action-bar { display: none !important; }
      body { padding: 20px; }
      @page { margin: 0.5in; size: A4; }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <p>&#128196; <strong>${tile.name}</strong> &mdash; Product Detail Sheet</p>
    <button class="btn btn-outline" onclick="window.print()">Print</button>
    <button class="btn btn-purple" onclick="downloadPDF()">Download PDF</button>
  </div>
  <div class="header">
    <div class="brand">
      <div class="brand-icon"><svg viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg></div>
      <div><div class="brand-name">TileHub</div><div class="brand-sub">Enterprise Tile Management</div></div>
    </div>
    <div class="doc-meta">
      <div class="sku-badge">${tile.sku}</div>
      <p>Generated: ${new Date().toLocaleString("en-IN")}</p>
      <p>Product Detail Sheet</p>
    </div>
  </div>
  <div class="product-title">${tile.name}</div>
  <div class="product-sub">${tile.category} Tile &nbsp;&middot;&nbsp; ${tile.size} cm &nbsp;&middot;&nbsp; ${tile.finish} &nbsp;&middot;&nbsp; ${tile.color}</div>
  <div class="stock-row">
    <div class="stock-box qty">
      <div class="slabel">Current Stock</div>
      <div class="svalue" style="color:#16a34a">${tile.stockQty} <span style="font-size:13px;font-weight:500">boxes</span></div>
    </div>
    <div class="stock-box price">
      <div class="slabel">Price per Box</div>
      <div class="svalue" style="color:#a16207">${formatCurrency(tile.pricePerBox)}</div>
    </div>
    <div class="stock-box" style="background:#fff5f5;border-color:#fecaca;">
      <div class="slabel">Stock Status</div>
      <div class="svalue" style="color:${stockStatus.color}">${stockStatus.label}</div>
    </div>
  </div>
  ${tileImageSection}
  <div class="content-row">
    <div class="specs">
      <div class="spec-section-title">Product Specifications</div>
      <div class="spec-grid">
        <div class="spec-item"><div class="spec-label">Category</div><div class="spec-value">${tile.category}</div></div>
        <div class="spec-item"><div class="spec-label">Size</div><div class="spec-value">${tile.size} cm</div></div>
        <div class="spec-item"><div class="spec-label">Finish</div><div class="spec-value">${tile.finish}</div></div>
        <div class="spec-item"><div class="spec-label">Color</div><div class="spec-value">${tile.color}</div></div>
        <div class="spec-item"><div class="spec-label">Thickness</div><div class="spec-value">${thickness}</div></div>
        <div class="spec-item"><div class="spec-label">Min Stock Alert</div><div class="spec-value">${tile.minStock} boxes</div></div>
      </div>
    </div>
    ${qrSection}
  </div>
  ${tile.description ? `<div class="spec-section-title" style="margin-bottom:8px">Description</div><div class="desc-box"><p>${tile.description}</p></div>` : ""}
  <div class="footer">
    <p>TileHub Enterprise &copy; ${new Date().getFullYear()} &nbsp;&middot;&nbsp; Confidential</p>
    <p>Auto-generated. For internal use only.</p>
  </div>
  <script>
    function downloadPDF() {
      var style = document.createElement('style');
      style.textContent = '.action-bar { display: none !important; }';
      document.head.appendChild(style);
      setTimeout(function() {
        window.print();
        setTimeout(function() { document.head.removeChild(style); }, 1500);
      }, 300);
    }
  </script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow popups to export PDF.");
      setExportingId(null);
      return;
    }
    win.document.write(html);
    win.document.close();
    setExportingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Overview</h1>
          <p className="page-subtitle">View current tile inventory</p>
        </div>
        <Link href="/subadmin/scan" className="btn-primary">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <rect x="3" y="3" width="5" height="5" />
            <rect x="16" y="3" width="5" height="5" />
            <rect x="3" y="16" width="5" height="5" />
            <path d="M21 16h-3a2 2 0 00-2 2v3M21 21v-3a2 2 0 00-2-2h-3M3 11h3" />
          </svg>
          Scan &amp; Export
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Tile Models",
            value: tiles.length,
            color: "text-brand-purple-light",
            icon: "📦",
          },
          {
            label: "Total Boxes",
            value: tiles.reduce((a, t) => a + t.stockQty, 0).toLocaleString(),
            color: "text-blue-400",
            icon: "🏗️",
          },
          {
            label: "Low Stock",
            value: tiles.filter((t) => t.stockQty <= t.minStock).length,
            color: "text-red-400",
            icon: "⚠️",
          },
          {
            label: "Well Stocked",
            value: tiles.filter((t) => t.stockQty > t.minStock).length,
            color: "text-green-400",
            icon: "✅",
          },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <span className="text-2xl">{s.icon}</span>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-brand-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tiles..."
          className="input-field sm:max-w-xs"
        />
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="input-field sm:max-w-48"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {(search || filterCat) && (
          <button
            onClick={() => {
              setSearch("");
              setFilterCat("");
            }}
            className="btn-secondary self-start"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-brand-black-4">
                  <th className="table-header">Image</th>
                  <th className="table-header">Tile Name</th>
                  <th className="table-header">SKU</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Size</th>
                  <th className="table-header">Finish</th>
                  <th className="table-header">Color</th>
                  <th className="table-header">Price/Box</th>
                  <th className="table-header">Stock</th>
                  <th className="table-header">QR</th>
                  <th className="table-header">PDF</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-brand-black-4/40 transition-colors"
                  >
                    <td className="table-cell">
                      <TileImageCell tile={t} onClick={() => setImgTile(t)} />
                    </td>
                    <td className="table-cell font-medium">{t.name}</td>
                    <td className="table-cell">
                      <code className="text-xs text-brand-purple-light font-mono bg-brand-purple/10 px-2 py-0.5 rounded">
                        {t.sku}
                      </code>
                    </td>
                    <td className="table-cell">
                      <span className="badge-blue">{t.category}</span>
                    </td>
                    <td className="table-cell text-brand-muted">{t.size}</td>
                    <td className="table-cell text-brand-muted">{t.finish}</td>
                    <td className="table-cell text-brand-muted">{t.color}</td>
                    <td className="table-cell font-semibold text-green-400">
                      {formatCurrency(t.pricePerBox)}
                    </td>
                    <td className="table-cell">
                      <span
                        className={`font-bold ${t.stockQty <= t.minStock ? "text-red-400" : "text-brand-text"}`}
                      >
                        {t.stockQty}
                      </span>
                      <span className="text-brand-muted text-xs ml-1">
                        boxes
                      </span>
                    </td>
                    <td className="table-cell">
                      {t.qrCode ? (
                        <button
                          onClick={() => setQrTile(t)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-purple/10 border border-brand-purple/30 text-brand-purple-light hover:bg-brand-purple/20 transition-colors text-xs font-medium"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-3.5 h-3.5"
                          >
                            <rect x="3" y="3" width="5" height="5" />
                            <rect x="16" y="3" width="5" height="5" />
                            <rect x="3" y="16" width="5" height="5" />
                            <path d="M21 16h-3a2 2 0 00-2 2v3M21 21v-3a2 2 0 00-2-2h-3M3 11h3M11 3v3M3 8v3M8 3H5" />
                          </svg>
                          View QR
                        </button>
                      ) : (
                        <span className="text-brand-muted text-xs">No QR</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => exportProductPDF(t)}
                        disabled={exportingId === t.id}
                        title="Export product detail as PDF"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {exportingId === t.id ? (
                          <svg
                            className="animate-spin w-3.5 h-3.5"
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
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-3.5 h-3.5"
                          >
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        )}
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-brand-muted py-10">
                No tiles found
              </p>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((t) => (
              <div key={t.id} className="glass-card p-4">
                <div className="flex items-start gap-3 mb-2">
                  {t.imageUrl ? (
                    <button
                      type="button"
                      onClick={() => setImgTile(t)}
                      className="w-14 h-14 rounded-lg overflow-hidden border border-brand-border shrink-0 hover:border-brand-purple/50 transition-colors"
                    >
                      <img
                        src={t.imageUrl}
                        alt={t.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const btn = (e.target as HTMLImageElement)
                            .parentElement;
                          if (btn) btn.style.display = "none";
                        }}
                      />
                    </button>
                  ) : (
                    <div className="w-14 h-14 rounded-lg border border-dashed border-brand-border flex items-center justify-center shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="w-5 h-5 text-brand-muted"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-text text-sm truncate">
                      {t.name}
                    </p>
                    <code className="text-xs text-brand-purple-light font-mono">
                      {t.sku}
                    </code>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs mt-1">
                  <div>
                    <span className="text-brand-muted">Cat:</span>{" "}
                    <span className="text-brand-text">{t.category}</span>
                  </div>
                  <div>
                    <span className="text-brand-muted">Size:</span>{" "}
                    <span className="text-brand-text">{t.size}</span>
                  </div>
                  <div>
                    <span className="text-brand-muted">Finish:</span>{" "}
                    <span className="text-brand-text">{t.finish}</span>
                  </div>
                  <div>
                    <span className="text-brand-muted">Color:</span>{" "}
                    <span className="text-brand-text">{t.color}</span>
                  </div>
                  <div>
                    <span className="text-brand-muted">Price:</span>{" "}
                    <span className="text-green-400 font-semibold">
                      {formatCurrency(t.pricePerBox)}
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-muted">Stock:</span>{" "}
                    <span
                      className={`font-bold ${t.stockQty <= t.minStock ? "text-red-400" : "text-brand-text"}`}
                    >
                      {t.stockQty} boxes
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {t.qrCode && (
                    <button
                      onClick={() => setQrTile(t)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-brand-purple/10 border border-brand-purple/30 text-brand-purple-light text-xs font-medium hover:bg-brand-purple/20 transition-colors"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-3.5 h-3.5"
                      >
                        <rect x="3" y="3" width="5" height="5" />
                        <rect x="16" y="3" width="5" height="5" />
                        <rect x="3" y="16" width="5" height="5" />
                        <path d="M21 16h-3a2 2 0 00-2 2v3M21 21v-3a2 2 0 00-2-2h-3M3 11h3M11 3v3M3 8v3M8 3H5" />
                      </svg>
                      QR
                    </button>
                  )}
                  <button
                    onClick={() => exportProductPDF(t)}
                    disabled={exportingId === t.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
                  >
                    {exportingId === t.id ? (
                      <svg
                        className="animate-spin w-3.5 h-3.5"
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
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-3.5 h-3.5"
                      >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    )}
                    Export PDF
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-10 text-brand-muted">
                No tiles found
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Image Popup Modal ── */}
      {imgTile && (
        <ImagePopup
          tile={imgTile}
          onClose={() => setImgTile(null)}
          onExportPDF={() => exportProductPDF(imgTile)}
        />
      )}

      {/* ── QR Modal ── */}
      {qrTile && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setQrTile(null)}
        >
          <div
            className="glass-card w-full max-w-sm"
            style={{ boxShadow: "0 0 80px rgba(124,58,237,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
              <h2 className="font-semibold text-brand-text">📱 QR Code</h2>
              <button
                onClick={() => setQrTile(null)}
                className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-black-4 transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              {qrTile.imageUrl && (
                <div
                  className="w-full rounded-xl overflow-hidden border border-brand-border bg-brand-black cursor-pointer"
                  style={{ height: 140 }}
                  onClick={() => {
                    setQrTile(null);
                    setImgTile(qrTile);
                  }}
                >
                  <img
                    src={qrTile.imageUrl}
                    alt={qrTile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (
                        e.target as HTMLImageElement
                      ).parentElement!.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* WHITE background for QR so it's always scannable */}
              <div
                className="rounded-xl p-4 border-2 border-gray-200"
                style={{
                  background: "#ffffff",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
                }}
              >
                <img
                  src={qrTile.qrCode!}
                  alt={`QR — ${qrTile.sku}`}
                  className="w-56 h-56 rounded"
                  style={{ display: "block" }}
                />
              </div>

              <div className="text-center">
                <p className="font-bold text-brand-text text-lg">
                  {qrTile.name}
                </p>
                <code className="text-sm text-brand-purple-light font-mono">
                  {qrTile.sku}
                </code>
                <p className="text-xs text-brand-muted mt-1">
                  {qrTile.size} cm · {qrTile.finish} · {qrTile.color}
                </p>
                <div className="mt-2">
                  <span
                    className={`text-xs font-bold ${qrTile.stockQty <= qrTile.minStock ? "text-red-400" : "text-green-400"}`}
                  >
                    {qrTile.stockQty} boxes in stock
                  </span>
                </div>
              </div>

              <div className="w-full bg-brand-black-4 rounded-lg p-3 text-xs border border-brand-border">
                <p className="text-brand-muted font-semibold mb-1.5 uppercase tracking-wide">
                  QR Contains
                </p>
                <div className="space-y-1 text-brand-text">
                  <p>
                    • SKU:{" "}
                    <span className="text-brand-purple-light">
                      {qrTile.sku}
                    </span>
                  </p>
                  <p>• Name: {qrTile.name}</p>
                  <p>
                    • Category: {qrTile.category} · Size: {qrTile.size}
                  </p>
                  <p>
                    • Finish: {qrTile.finish} · Color: {qrTile.color}
                  </p>
                  <p>• Price: {formatCurrency(qrTile.pricePerBox)}/box</p>
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => downloadQR(qrTile)}
                  className="btn-primary flex-1 justify-center"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download PNG
                </button>
                <button
                  onClick={() => {
                    setQrTile(null);
                    exportProductPDF(qrTile);
                  }}
                  className="btn-secondary flex-1 justify-center"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
