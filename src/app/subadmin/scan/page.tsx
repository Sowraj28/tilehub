"use client";

import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";
import type { Tile } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface CartItem {
  tile: Tile;
  quantity: number;
}

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const scanningRef = useRef<boolean>(false);
  const lastScanTime = useRef<number>(0); // throttle for mobile performance

  const [scanning, setScanning] = useState(false);
  const [scannedTile, setScannedTile] = useState<Tile | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportNote, setExportNote] = useState("");
  const [imgErrored, setImgErrored] = useState(false);

  // ── stopCamera ─────────────────────────────────────────────────────────────
  const stopCamera = () => {
    scanningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    streamRef.current = null;
    setScanning(false);
  };

  // ── processQR — handles ALL possible QR formats ───────────────────────────
  // Supports: plain SKU string, JSON {"sku":"..."}, JSON {"SKU":"..."},
  // JSON with name/id/code keys, or any raw string treated as SKU directly
  const processQR = async (data: string) => {
    try {
      let sku = "";

      try {
        const parsed = JSON.parse(data);
        sku =
          parsed.sku ||
          parsed.SKU ||
          parsed.Sku ||
          parsed.skuCode ||
          parsed.code ||
          parsed.id ||
          "";
      } catch {
        // Not JSON — use raw string as the SKU directly
        sku = data.trim();
      }

      if (!sku) {
        setError("Could not extract SKU from QR code. Raw: " + data);
        return;
      }

      const r = await fetch("/api/tiles");
      const d = await r.json();
      if (d.success) {
        const tiles = d.data as Tile[];
        // Case-insensitive match for safety
        const tile = tiles.find(
          (t) => t.sku.toLowerCase() === sku.toLowerCase(),
        );
        if (tile) {
          setScannedTile(tile);
          setImgErrored(false);
          setError("");
        } else {
          setError(`Tile with SKU "${sku}" not found in database.`);
        }
      } else {
        setError("Failed to fetch tiles from server.");
      }
    } catch (err) {
      console.error("processQR error:", err);
      setError("Error processing QR code. Please try again.");
    }
  };

  // ── scanFrame — throttled every 200ms for mobile ───────────────────────────
  const scanFrame = () => {
    if (!scanningRef.current) return;

    const now = Date.now();
    if (now - lastScanTime.current < 200) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    lastScanTime.current = now;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    // Wait for real video dimensions
    if (
      video.readyState !== video.HAVE_ENOUGH_DATA ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let imageData: ImageData;
    try {
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    // attemptBoth = try normal + inverted, catches more QR codes
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });

    if (code?.data) {
      stopCamera();
      processQR(code.data);
    } else {
      rafRef.current = requestAnimationFrame(scanFrame);
    }
  };

  // ── startCamera — with fallback for mobile compatibility ──────────────────
  const startCamera = async () => {
    setError("");
    if (scanningRef.current) stopCamera();

    try {
      let stream: MediaStream;

      try {
        // Prefer rear camera on mobile
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        // Fallback: accept any camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;

      // Wait for metadata before playing
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
      });
      await video.play();

      scanningRef.current = true;
      lastScanTime.current = 0;
      setScanning(true);
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      console.error("Camera error:", err);
      setError(
        "Camera access denied or unavailable. Please allow camera permissions and try again.",
      );
    }
  };

  const addToCart = (tile: Tile) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.tile.id === tile.id);
      if (existing) {
        return prev.map((c) =>
          c.tile.id === tile.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { tile, quantity: 1 }];
    });
    setScannedTile(null);
  };

  const updateQty = (tileId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.tile.id !== tileId));
    } else {
      setCart((prev) =>
        prev.map((c) => (c.tile.id === tileId ? { ...c, quantity: qty } : c)),
      );
    }
  };

  const totalBoxes = cart.reduce((a, c) => a + c.quantity, 0);
  const totalValue = cart.reduce(
    (a, c) => a + c.quantity * c.tile.pricePerBox,
    0,
  );

  const handleExport = async () => {
    if (cart.length === 0) return;
    setExporting(true);
    try {
      const r = await fetch("/api/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((c) => ({ tileId: c.tile.id, quantity: c.quantity })),
          note: exportNote,
        }),
      });
      const d = await r.json();
      if (d.success) {
        await generatePDF(d.data);
        setCart([]);
        setExportNote("");
        setSuccess(
          "✅ Export successful! Stock updated. PDF is downloading...",
        );
        setTimeout(() => setSuccess(""), 6000);
      } else {
        setError(d.error || "Export failed");
      }
    } catch {
      setError("Network error during export");
    } finally {
      setExporting(false);
    }
  };

  const generatePDF = async (exportData: {
    id: string;
    createdAt: string;
    subAdmin?: { displayName: string };
    items: Array<{ tile?: Tile; quantity: number; price: number }>;
  }) => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, 210, 297, "F");
    doc.setFillColor(28, 28, 40);
    doc.rect(0, 0, 210, 45, "F");
    doc.setTextColor(167, 139, 250);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("TILEHUB", 15, 20);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(136, 136, 168);
    doc.text("Enterprise Tile Management System", 15, 27);
    doc.text("Export / Dispatch Bill", 15, 33);
    doc.setTextColor(226, 226, 240);
    doc.setFontSize(8);
    doc.text(
      `Export ID: #${exportData.id.slice(0, 12).toUpperCase()}`,
      130,
      18,
    );
    doc.text(
      `Date: ${new Date(exportData.createdAt).toLocaleString("en-IN")}`,
      130,
      24,
    );
    doc.text(`By: ${exportData.subAdmin?.displayName || "Sub Admin"}`, 130, 30);
    doc.setDrawColor(45, 45, 58);
    doc.line(15, 47, 195, 47);

    const rows = exportData.items.map((item, i) => [
      String(i + 1),
      item.tile?.name || "—",
      item.tile?.sku || "—",
      item.tile?.size ? `${item.tile.size} cm` : "—",
      item.tile?.finish || "—",
      item.tile?.color || "—",
      String(item.quantity),
      `Rs. ${item.price.toLocaleString("en-IN")}`,
      `Rs. ${(item.quantity * item.price).toLocaleString("en-IN")}`,
    ]);

    autoTable(doc, {
      head: [
        [
          "#",
          "Tile Name",
          "SKU",
          "Size",
          "Finish",
          "Color",
          "Qty",
          "Rate",
          "Total",
        ],
      ],
      body: rows,
      startY: 52,
      margin: { left: 15, right: 15 },
      styles: {
        fillColor: [24, 24, 31],
        textColor: [226, 226, 240],
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [92, 33, 182],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: [30, 30, 40] },
      columnStyles: {
        0: { halign: "center", cellWidth: 8 },
        6: { halign: "center" },
        7: { halign: "right" },
        8: { halign: "right", fontStyle: "bold" },
      },
    });

    const finalY =
      (doc as typeof jsPDF.prototype & { lastAutoTable: { finalY: number } })
        .lastAutoTable.finalY + 8;
    doc.setFillColor(20, 20, 30);
    doc.setDrawColor(92, 33, 182);
    doc.roundedRect(15, finalY, 180, 28, 3, 3, "FD");
    doc.setTextColor(167, 139, 250);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Boxes: ${totalBoxes}`, 25, finalY + 11);
    doc.text(
      `Total Value: Rs. ${totalValue.toLocaleString("en-IN")}`,
      25,
      finalY + 20,
    );
    if (exportNote) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(136, 136, 168);
      doc.text(`Note: ${exportNote}`, 120, finalY + 15);
    }
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 120);
    doc.text(
      "This is a computer-generated document. No signature required. — TileHub Enterprise System",
      15,
      286,
    );
    doc.setDrawColor(45, 45, 58);
    doc.line(15, 282, 195, 282);
    doc.save(`TileHub_Export_${exportData.id.slice(0, 8).toUpperCase()}.pdf`);
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scan & Export</h1>
          <p className="page-subtitle">Scan QR codes and create export bills</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-900/30 border border-green-800/50 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-900/30 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between gap-2">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="shrink-0 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Scanner */}
      <div className="glass-card p-5">
        <h2 className="font-semibold text-brand-text mb-4 flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-5 h-5 text-brand-purple-light"
          >
            <rect x="3" y="3" width="5" height="5" />
            <rect x="16" y="3" width="5" height="5" />
            <rect x="3" y="16" width="5" height="5" />
            <path d="M21 16h-3a2 2 0 00-2 2v3M21 21v-3a2 2 0 00-2-2h-3M3 11h3" />
          </svg>
          QR Scanner
        </h2>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full max-w-sm aspect-video bg-brand-black rounded-xl overflow-hidden border-2 border-brand-border">
            {/* autoPlay added for iOS Safari compatibility */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-52 h-52">
                  {[
                    "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                    "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                    "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                    "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                  ].map((cls, i) => (
                    <div
                      key={i}
                      className={`absolute w-6 h-6 border-brand-purple-light ${cls}`}
                    />
                  ))}
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-brand-purple-light opacity-80"
                    style={{ animation: "scanLine 2s ease-in-out infinite" }}
                  />
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-brand-purple-light text-xs px-3 py-1 rounded-full">
                  Scanning...
                </div>
              </div>
            )}
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-muted gap-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-14 h-14 opacity-30"
                >
                  <rect x="3" y="3" width="5" height="5" />
                  <rect x="16" y="3" width="5" height="5" />
                  <rect x="3" y="16" width="5" height="5" />
                  <path d="M21 16h-3a2 2 0 00-2 2v3M21 21v-3a2 2 0 00-2-2h-3M3 11h3M11 3v3M3 8v3M8 3H5" />
                </svg>
                <p className="text-sm">Camera off — click Start to scan</p>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <button
            onClick={scanning ? stopCamera : startCamera}
            className={scanning ? "btn-danger" : "btn-primary"}
          >
            {scanning ? (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Stop Scanner
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Start QR Scanner
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Scanned Tile ── */}
      {scannedTile && (
        <div
          className="glass-card p-5"
          style={{
            borderColor: "#7C3AED",
            boxShadow: "0 0 30px rgba(124,58,237,0.2)",
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-semibold text-brand-purple-light flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Tile Detected
            </h2>
            <button
              onClick={() => setScannedTile(null)}
              className="text-brand-muted hover:text-brand-text p-1 rounded hover:bg-brand-black-4"
            >
              ✕
            </button>
          </div>

          {scannedTile.imageUrl && !imgErrored && (
            <div
              className="mb-5 rounded-xl overflow-hidden border-2 border-brand-purple/30 bg-brand-black"
              style={{ maxHeight: 260 }}
            >
              <img
                src={scannedTile.imageUrl}
                alt={scannedTile.name}
                className="w-full object-cover"
                style={{ maxHeight: 260 }}
                onError={() => setImgErrored(true)}
              />
            </div>
          )}

          {(!scannedTile.imageUrl || imgErrored) && (
            <div
              className="mb-5 rounded-xl border-2 border-dashed border-brand-border bg-brand-black-4 flex items-center justify-center"
              style={{ height: 100 }}
            >
              <div className="flex flex-col items-center gap-1 text-brand-muted">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-8 h-8 opacity-30"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="text-xs">No image available</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {[
              { l: "Name", v: scannedTile.name },
              { l: "SKU", v: scannedTile.sku },
              { l: "Category", v: scannedTile.category },
              { l: "Size", v: `${scannedTile.size} cm` },
              { l: "Finish", v: scannedTile.finish },
              { l: "Color", v: scannedTile.color },
              { l: "Thickness", v: scannedTile.thickness },
              { l: "Price / Box", v: formatCurrency(scannedTile.pricePerBox) },
              { l: "Current Stock", v: `${scannedTile.stockQty} boxes` },
            ].map((f) => (
              <div
                key={f.l}
                className="bg-brand-black-4 rounded-lg p-3 border border-brand-border"
              >
                <p className="text-xs text-brand-muted">{f.l}</p>
                <p className="font-semibold text-brand-text mt-0.5 text-sm truncate">
                  {f.v}
                </p>
              </div>
            ))}
          </div>

          <div className="mb-4">
            {scannedTile.stockQty === 0 ? (
              <span className="badge-red">Out of Stock</span>
            ) : scannedTile.stockQty <= scannedTile.minStock ? (
              <span className="badge-yellow">
                ⚠️ Low Stock — only {scannedTile.stockQty} boxes left
              </span>
            ) : (
              <span className="badge-green">
                ✅ In Stock — {scannedTile.stockQty} boxes available
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => addToCart(scannedTile)}
              className="btn-primary"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add to Export Cart
            </button>
            <button onClick={() => startCamera()} className="btn-secondary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Scan Another
            </button>
          </div>
        </div>
      )}

      {/* Cart */}
      {cart.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
            <h2 className="font-semibold text-brand-text">
              🛒 Export Cart
              <span className="text-brand-muted font-normal ml-2 text-sm">
                ({cart.length} item types)
              </span>
            </h2>
            <span className="badge-purple">{totalBoxes} boxes total</span>
          </div>

          <div className="divide-y divide-brand-border/50">
            {cart.map((c) => (
              <div
                key={c.tile.id}
                className="px-5 py-3 flex items-center gap-3 sm:gap-4"
              >
                <div className="shrink-0">
                  {c.tile.imageUrl ? (
                    <img
                      src={c.tile.imageUrl}
                      alt={c.tile.name}
                      className="w-10 h-10 rounded-lg object-cover border border-brand-border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg border border-dashed border-brand-border flex items-center justify-center bg-brand-black-4">
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
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-text text-sm truncate">
                    {c.tile.name}
                  </p>
                  <p className="text-xs text-brand-muted">
                    <code className="text-brand-purple-light">
                      {c.tile.sku}
                    </code>{" "}
                    · {formatCurrency(c.tile.pricePerBox)}/box
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateQty(c.tile.id, c.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-brand-black-4 hover:bg-brand-black-5 text-brand-text font-bold text-sm flex items-center justify-center border border-brand-border transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={c.quantity}
                    onChange={(e) =>
                      updateQty(c.tile.id, parseInt(e.target.value) || 0)
                    }
                    className="w-14 bg-brand-black-4 border border-brand-border text-center text-sm rounded-lg px-1 py-1 text-brand-text outline-none focus:border-brand-purple"
                  />
                  <button
                    onClick={() => updateQty(c.tile.id, c.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-brand-black-4 hover:bg-brand-black-5 text-brand-text font-bold text-sm flex items-center justify-center border border-brand-border transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="text-right shrink-0 min-w-[80px]">
                  <p className="text-sm font-semibold text-green-400">
                    {formatCurrency(c.quantity * c.tile.pricePerBox)}
                  </p>
                  <p className="text-xs text-brand-muted">{c.quantity} boxes</p>
                </div>
                <button
                  onClick={() => updateQty(c.tile.id, 0)}
                  className="text-brand-muted hover:text-red-400 transition-colors p-1 shrink-0"
                  title="Remove"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 bg-brand-black-4 border-t border-brand-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-muted text-sm">
                  Total:{" "}
                  <span className="text-2xl font-bold text-green-400">
                    {formatCurrency(totalValue)}
                  </span>
                </p>
                <p className="text-xs text-brand-muted mt-0.5">
                  {totalBoxes} boxes · {cart.length} tile types
                </p>
              </div>
              <div className="bg-brand-black-5 border border-brand-border rounded-lg px-3 py-2 text-right">
                <p className="text-xs text-brand-muted">Stock will be</p>
                <p className="text-sm font-semibold text-red-400">
                  auto-deducted
                </p>
              </div>
            </div>
            <input
              value={exportNote}
              onChange={(e) => setExportNote(e.target.value)}
              placeholder="Add a note (optional, e.g. Project name)..."
              className="input-field"
            />
            <button
              onClick={handleExport}
              disabled={exporting || cart.length === 0}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              {exporting ? (
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
                  Processing Export...
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
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Export Bill & Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scanLine {
          0% { top: 0; opacity: 1; }
          50% { top: calc(100% - 2px); opacity: 0.6; }
          100% { top: 0; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
