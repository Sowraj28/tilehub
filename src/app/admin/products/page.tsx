"use client";
import { useEffect, useState, useRef } from "react";
import type { Tile } from "@/types";
import { formatCurrency } from "@/lib/utils";

type ModalType = "add" | "edit" | "delete" | "qr" | "stock" | "image" | null;

const CATEGORIES = [
  "Floor",
  "Wall",
  "Outdoor",
  "Bathroom",
  "Kitchen",
  "Parking",
  "Commercial",
  "Decorative",
];
const SIZES = [
  "30x30",
  "60x60",
  "60x120",
  "80x80",
  "30x60",
  "20x20",
  "45x45",
  "75x150",
  "120x120",
  "90x180",
];
const FINISHES = [
  "Polished",
  "Matte",
  "Rustic",
  "Glossy",
  "Satin",
  "Textured",
  "Lappato",
  "Natural",
];

const EMPTY_FORM = {
  name: "",
  category: "",
  size: "",
  finish: "",
  color: "",
  thickness: "10mm",
  pricePerBox: "",
  stockQty: "",
  minStock: "10",
  description: "",
  imageUrl: "",
};

interface StockForm {
  type: string;
  quantity: string;
  note: string;
}

// ── Image Cropper ─────────────────────────────────────────────────────────────
function ImageCropper({
  src,
  onCrop,
  onCancel,
}: {
  src: string;
  onCrop: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState({ x: 40, y: 40, w: 200, h: 200 });
  const [dragging, setDragging] = useState<"move" | "resize" | null>(null);
  const [dragStart, setDragStart] = useState({
    mx: 0,
    my: 0,
    cx: 0,
    cy: 0,
    cw: 0,
    ch: 0,
  });
  const [imgLoaded, setImgLoaded] = useState(false);

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const onMouseDown = (e: React.MouseEvent, type: "move" | "resize") => {
    e.preventDefault();
    setDragging(type);
    setDragStart({
      mx: e.clientX,
      my: e.clientY,
      cx: crop.x,
      cy: crop.y,
      cw: crop.w,
      ch: crop.h,
    });
  };

  useEffect(() => {
    const onUp = () => setDragging(null);
    const onMove = (e: MouseEvent) => {
      if (!dragging || !containerRef.current) return;
      const cont = containerRef.current;
      const dx = e.clientX - dragStart.mx;
      const dy = e.clientY - dragStart.my;
      if (dragging === "move") {
        setCrop((c) => ({
          ...c,
          x: clamp(dragStart.cx + dx, 0, cont.clientWidth - c.w),
          y: clamp(dragStart.cy + dy, 0, cont.clientHeight - c.h),
        }));
      } else {
        setCrop((c) => ({
          ...c,
          w: clamp(dragStart.cw + dx, 60, cont.clientWidth - dragStart.cx),
          h: clamp(dragStart.ch + dy, 60, cont.clientHeight - dragStart.cy),
        }));
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, dragStart]);

  const handleCrop = () => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;
    const scaleX = img.naturalWidth / container.clientWidth;
    const scaleY = img.naturalHeight / container.clientHeight;
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.w * scaleX,
      crop.h * scaleY,
      0,
      0,
      600,
      600,
    );
    onCrop(canvas.toDataURL("image/jpeg", 0.75));
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-brand-muted text-center">
        Drag the box to position · Drag corner to resize
      </p>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border-2 border-brand-border bg-brand-black"
        style={{ height: 300, userSelect: "none" }}
      >
        <img
          ref={imgRef}
          src={src}
          onLoad={() => setImgLoaded(true)}
          className="w-full h-full object-contain"
          draggable={false}
          alt="crop"
        />
        {imgLoaded && (
          <>
            <div className="absolute inset-0 bg-black/50 pointer-events-none" />
            <div
              className="absolute border-2 border-brand-purple-light"
              style={{
                left: crop.x,
                top: crop.y,
                width: crop.w,
                height: crop.h,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="absolute inset-0 cursor-move"
                onMouseDown={(e) => onMouseDown(e, "move")}
              />
              {[...Array(2)].map((_, i) => (
                <div
                  key={`v${i}`}
                  className="absolute top-0 bottom-0 border-l border-white/20 pointer-events-none"
                  style={{ left: `${(i + 1) * 33.33}%` }}
                />
              ))}
              {[...Array(2)].map((_, i) => (
                <div
                  key={`h${i}`}
                  className="absolute left-0 right-0 border-t border-white/20 pointer-events-none"
                  style={{ top: `${(i + 1) * 33.33}%` }}
                />
              ))}
              <div
                className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize"
                style={{ background: "#A78BFA", borderRadius: "3px 0 3px 0" }}
                onMouseDown={(e) => onMouseDown(e, "resize")}
              />
            </div>
          </>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="btn-secondary flex-1 justify-center"
        >
          Cancel
        </button>
        <button
          onClick={handleCrop}
          className="btn-primary flex-1 justify-center"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Crop & Use
        </button>
      </div>
    </div>
  );
}

// ── Image Upload Modal ────────────────────────────────────────────────────────
function ImageUploadModal({
  currentImage,
  onSave,
  onClose,
}: {
  currentImage?: string;
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState(
    currentImage && !currentImage.startsWith("data:") ? currentImage : "",
  );
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [urlError, setUrlError] = useState("");
  const [imgLoadOk, setImgLoadOk] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // If currentImage is a URL (not base64), default to URL tab
  useEffect(() => {
    if (currentImage && !currentImage.startsWith("data:")) {
      setTab("url");
    }
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024)
      alert("Image is large. It will be compressed automatically.");
    const reader = new FileReader();
    reader.onload = () => {
      setRawSrc(reader.result as string);
      setCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawSrc(reader.result as string);
      setCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlLoad = () => {
    setUrlError("");
    setImgLoadOk(false);
    const url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setUrlError("Please enter a valid URL starting with http:// or https://");
      return;
    }
    setPreview(url);
  };

  const handleCropped = (dataUrl: string) => {
    setPreview(dataUrl);
    setCropping(false);
    setRawSrc(null);
  };

  if (cropping && rawSrc) {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-brand-text">Crop Image</h3>
        <ImageCropper
          src={rawSrc}
          onCrop={handleCropped}
          onCancel={() => {
            setCropping(false);
            setRawSrc(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-brand-black-4 rounded-lg p-1">
        {(["upload", "url"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-brand-purple text-white" : "text-brand-muted hover:text-brand-text"}`}
          >
            {t === "upload" ? "📁 Upload File" : "🔗 Paste URL"}
          </button>
        ))}
      </div>

      {tab === "upload" ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-brand-border hover:border-brand-purple/50 rounded-xl p-8 text-center cursor-pointer transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-purple/20 transition-colors">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-6 h-6 text-brand-purple-light"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="text-brand-text font-medium text-sm">
            Drop image here or click to browse
          </p>
          <p className="text-brand-muted text-xs mt-1">
            JPG, PNG, WebP · Auto-compressed
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setImgLoadOk(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleUrlLoad()}
              placeholder="https://example.com/tile-image.jpg"
              className="input-field flex-1"
              autoFocus
            />
            <button onClick={handleUrlLoad} className="btn-primary px-4">
              Load
            </button>
          </div>
          {urlError && <p className="text-red-400 text-xs">{urlError}</p>}
          <p className="text-xs text-brand-muted">
            URL images are stored as-is (must remain publicly accessible)
          </p>
        </div>
      )}

      {preview && (
        <div className="space-y-2">
          <div
            className="relative rounded-xl overflow-hidden border border-brand-border bg-brand-black"
            style={{ height: 200 }}
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              onLoad={() => setImgLoadOk(true)}
              onError={() => {
                setUrlError(
                  "Could not load image from this URL. Check CORS or try a different URL.",
                );
                setImgLoadOk(false);
                setPreview(null);
              }}
            />
            {!imgLoadOk && preview.startsWith("http") && (
              <div className="absolute inset-0 flex items-center justify-center bg-brand-black/60">
                <div className="w-5 h-5 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <button
              onClick={() => {
                setPreview(null);
                setImgLoadOk(false);
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-500/80 transition-colors"
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
          {rawSrc && (
            <button
              onClick={() => setCropping(true)}
              className="text-xs text-brand-purple-light hover:underline"
            >
              Re-crop image
            </button>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="btn-secondary flex-1 justify-center"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (preview) onSave(preview);
          }}
          disabled={!preview || (preview.startsWith("http") && !imgLoadOk)}
          className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Use This Image
        </button>
      </div>
    </div>
  );
}

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
      title="View image"
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
  onEdit,
}: {
  tile: Tile;
  onClose: () => void;
  onEdit: () => void;
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
          <div className="mt-3 flex gap-2 text-xs text-brand-muted justify-center flex-wrap">
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
                onEdit();
              }}
              className="btn-secondary text-sm"
            >
              Edit Tile
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

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<Tile | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [stockForm, setStockForm] = useState<StockForm>({
    type: "ADD",
    quantity: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [imgTile, setImgTile] = useState<Tile | null>(null);

  useEffect(() => {
    loadTiles();
  }, []);

  const loadTiles = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/tiles");
      const d = await r.json();
      if (d.success) setTiles(d.data);
    } catch {}
    setLoading(false);
  };

  const openAdd = () => {
    setSelected(null);
    setForm(EMPTY_FORM);
    setError("");
    setModal("add");
  };
  const openEdit = (t: Tile) => {
    setSelected(t);
    setForm({
      name: t.name,
      category: t.category,
      size: t.size,
      finish: t.finish,
      color: t.color,
      thickness: t.thickness,
      pricePerBox: String(t.pricePerBox),
      stockQty: String(t.stockQty),
      minStock: String(t.minStock),
      description: t.description || "",
      imageUrl: t.imageUrl || "",
    });
    setError("");
    setModal("edit");
  };
  const openDelete = (t: Tile) => {
    setSelected(t);
    setModal("delete");
  };
  const openQR = (t: Tile) => {
    setSelected(t);
    setModal("qr");
  };
  const openStock = (t: Tile) => {
    setSelected(t);
    setStockForm({ type: "ADD", quantity: "", note: "" });
    setError("");
    setModal("stock");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = JSON.stringify(form);
      if (payload.length > 8 * 1024 * 1024) {
        setError(
          "Image is too large. Please use a smaller image or a URL instead.",
        );
        setSaving(false);
        return;
      }
      const url =
        modal === "edit" ? `/api/tiles/${selected?.id}` : "/api/tiles";
      const method = modal === "edit" ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      const d = await r.json();
      if (d.success) {
        await loadTiles();
        setModal(null);
      } else setError(d.error || "Failed to save tile");
    } catch {
      setError("Network error");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const r = await fetch(`/api/tiles/${selected?.id}`, { method: "DELETE" });
      const d = await r.json();
      if (d.success) {
        await loadTiles();
        setModal(null);
      } else setError(d.error || "Delete failed");
    } catch {}
    setSaving(false);
  };

  const handleStock = async () => {
    setSaving(true);
    setError("");
    try {
      const r = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tileId: selected?.id, ...stockForm }),
      });
      const d = await r.json();
      if (d.success) {
        await loadTiles();
        setModal(null);
      } else setError(d.error || "Stock update failed");
    } catch {
      setError("Network error");
    }
    setSaving(false);
  };

  const downloadQR = () => {
    if (!selected?.qrCode) return;
    const a = document.createElement("a");
    a.href = selected.qrCode;
    a.download = `QR_${selected.sku}.png`;
    a.click();
  };

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

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tile Products</h1>
          <p className="page-subtitle">{tiles.length} tiles in inventory</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
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
          Add New Tile
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, SKU, category..."
          className="input-field sm:max-w-xs"
        />
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="input-field sm:max-w-48"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
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
        <div className="flex items-center justify-center h-64">
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
                  <th className="table-header">Price/Box</th>
                  <th className="table-header">Stock</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tile) => (
                  <tr
                    key={tile.id}
                    className="hover:bg-brand-black-4/40 transition-colors group"
                  >
                    <td className="table-cell">
                      <TileImageCell
                        tile={tile}
                        onClick={() => setImgTile(tile)}
                      />
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-brand-text">
                          {tile.name}
                        </p>
                        <p className="text-xs text-brand-muted">
                          {tile.color} · {tile.thickness}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <code className="text-xs text-brand-purple-light bg-brand-purple/10 px-2 py-1 rounded font-mono">
                        {tile.sku}
                      </code>
                    </td>
                    <td className="table-cell">
                      <span className="badge-blue">{tile.category}</span>
                    </td>
                    <td className="table-cell text-brand-muted text-sm">
                      {tile.size} cm
                    </td>
                    <td className="table-cell text-brand-muted text-sm">
                      {tile.finish}
                    </td>
                    <td className="table-cell font-semibold text-green-400">
                      {formatCurrency(tile.pricePerBox)}
                    </td>
                    <td className="table-cell">
                      <span
                        className={`font-bold ${tile.stockQty <= tile.minStock ? "text-red-400" : "text-brand-text"}`}
                      >
                        {tile.stockQty}
                      </span>
                      <span className="text-brand-muted text-xs ml-1">
                        boxes
                      </span>
                    </td>
                    <td className="table-cell">
                      {tile.stockQty === 0 ? (
                        <span className="badge-red">Out of Stock</span>
                      ) : tile.stockQty <= tile.minStock ? (
                        <span className="badge-yellow">Low Stock</span>
                      ) : (
                        <span className="badge-green">In Stock</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <TileActionBtn
                          label="Stock"
                          onClick={() => openStock(tile)}
                        >
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
                        </TileActionBtn>
                        <TileActionBtn label="QR" onClick={() => openQR(tile)}>
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
                        </TileActionBtn>
                        <TileActionBtn
                          label="Edit"
                          onClick={() => openEdit(tile)}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-3.5 h-3.5"
                          >
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </TileActionBtn>
                        <TileActionBtn
                          label="Delete"
                          onClick={() => openDelete(tile)}
                          danger
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-3.5 h-3.5"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                          </svg>
                        </TileActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-3xl mb-3">🔍</p>
                <p className="text-brand-muted">
                  {search || filterCat
                    ? "No tiles match your search."
                    : "No tiles yet. Add your first tile!"}
                </p>
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((tile) => (
              <div
                key={tile.id}
                className="glass-card p-4 hover:border-brand-border-light transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <TileImageCell
                      tile={tile}
                      onClick={() => setImgTile(tile)}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-text truncate">
                        {tile.name}
                      </p>
                      <code className="text-xs text-brand-purple-light font-mono">
                        {tile.sku}
                      </code>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {tile.stockQty === 0 ? (
                      <span className="badge-red text-xs">Out</span>
                    ) : tile.stockQty <= tile.minStock ? (
                      <span className="badge-yellow text-xs">Low</span>
                    ) : (
                      <span className="badge-green text-xs">OK</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
                  <div>
                    <span className="text-brand-muted">Category:</span>{" "}
                    <span className="text-brand-text">{tile.category}</span>
                  </div>
                  <div>
                    <span className="text-brand-muted">Size:</span>{" "}
                    <span className="text-brand-text">{tile.size}</span>
                  </div>
                  <div>
                    <span className="text-brand-muted">Finish:</span>{" "}
                    <span className="text-brand-text">{tile.finish}</span>
                  </div>
                  <div>
                    <span className="text-brand-muted">Color:</span>{" "}
                    <span className="text-brand-text">{tile.color}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-brand-border">
                  <div>
                    <p className="text-green-400 font-bold text-sm">
                      {formatCurrency(tile.pricePerBox)}
                    </p>
                    <p
                      className={`text-xs font-semibold ${tile.stockQty <= tile.minStock ? "text-red-400" : "text-brand-muted"}`}
                    >
                      {tile.stockQty} boxes
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openStock(tile)}
                      className="btn-secondary text-xs px-2.5 py-1.5"
                    >
                      Stock
                    </button>
                    <button
                      onClick={() => openQR(tile)}
                      className="btn-secondary text-xs px-2.5 py-1.5"
                    >
                      QR
                    </button>
                    <button
                      onClick={() => openEdit(tile)}
                      className="btn-secondary text-xs px-2.5 py-1.5"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDelete(tile)}
                      className="btn-danger text-xs px-2.5 py-1.5"
                    >
                      Del
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Image Popup Modal ── */}
      {imgTile && (
        <ImagePopup
          tile={imgTile}
          onClose={() => setImgTile(null)}
          onEdit={() => openEdit(imgTile)}
        />
      )}

      {/* ── Add / Edit Modal ── */}
      {(modal === "add" || modal === "edit") && (
        <Modal
          title={modal === "add" ? "➕ Add New Tile" : "✏️ Edit Tile"}
          onClose={() => setModal(null)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Image section */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-brand-muted mb-1.5">
                Tile Image
              </label>
              {form.imageUrl ? (
                <div className="flex items-center gap-4 p-3 rounded-xl border border-brand-border bg-brand-black-4">
                  <button
                    type="button"
                    onClick={() => {
                      const fakeTile = {
                        ...(selected || {}),
                        ...form,
                        pricePerBox: Number(form.pricePerBox),
                        stockQty: selected?.stockQty ?? 0,
                        minStock: Number(form.minStock),
                      } as Tile;
                      setImgTile(fakeTile);
                    }}
                    className="w-20 h-20 rounded-lg overflow-hidden border border-brand-border shrink-0 hover:border-brand-purple/50 transition-colors"
                  >
                    <img
                      src={form.imageUrl}
                      alt="Tile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-brand-text font-medium">
                      Image added ✓
                    </p>
                    <p className="text-xs text-brand-muted mt-0.5">
                      {form.imageUrl.startsWith("data:")
                        ? "Uploaded file"
                        : "External URL"}{" "}
                      · Click thumbnail to preview
                    </p>
                    {!form.imageUrl.startsWith("data:") && (
                      <p className="text-xs text-brand-purple-light mt-0.5 truncate">
                        {form.imageUrl}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => setModal("image")}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      Change
                    </button>
                    <button
                      onClick={() => setForm((p) => ({ ...p, imageUrl: "" }))}
                      className="text-xs text-red-400 hover:underline px-3 py-1.5"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setModal("image")}
                  className="w-full border-2 border-dashed border-brand-border hover:border-brand-purple/50 rounded-xl p-5 text-center transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center mx-auto mb-2 group-hover:bg-brand-purple/20 transition-colors">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-5 h-5 text-brand-purple-light"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <p className="text-sm text-brand-muted group-hover:text-brand-text transition-colors">
                    Click to add tile image
                  </p>
                  <p className="text-xs text-brand-muted mt-0.5">
                    Upload from device or paste URL · Shows in QR & PDF
                  </p>
                </button>
              )}
            </div>

            <Field label="Tile Name *">
              <input
                className="input-field"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Marble White Premium"
              />
            </Field>
            <Field label="Category *">
              <select
                className="input-field"
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Size *">
              <select
                className="input-field"
                value={form.size}
                onChange={(e) =>
                  setForm((p) => ({ ...p, size: e.target.value }))
                }
              >
                <option value="">Select size</option>
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s} cm
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Finish *">
              <select
                className="input-field"
                value={form.finish}
                onChange={(e) =>
                  setForm((p) => ({ ...p, finish: e.target.value }))
                }
              >
                <option value="">Select finish</option>
                {FINISHES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Color *">
              <input
                className="input-field"
                value={form.color}
                onChange={(e) =>
                  setForm((p) => ({ ...p, color: e.target.value }))
                }
                placeholder="e.g. White, Beige, Grey"
              />
            </Field>
            <Field label="Thickness">
              <input
                className="input-field"
                value={form.thickness}
                onChange={(e) =>
                  setForm((p) => ({ ...p, thickness: e.target.value }))
                }
                placeholder="e.g. 10mm"
              />
            </Field>
            <Field label="Price per Box (₹) *">
              <input
                type="number"
                min="0"
                className="input-field"
                value={form.pricePerBox}
                onChange={(e) =>
                  setForm((p) => ({ ...p, pricePerBox: e.target.value }))
                }
                placeholder="0.00"
              />
            </Field>
            {modal === "add" && (
              <Field label="Initial Stock (Boxes)">
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  value={form.stockQty}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, stockQty: e.target.value }))
                  }
                  placeholder="0"
                />
              </Field>
            )}
            <Field label="Min Stock Alert">
              <input
                type="number"
                min="0"
                className="input-field"
                value={form.minStock}
                onChange={(e) =>
                  setForm((p) => ({ ...p, minStock: e.target.value }))
                }
                placeholder="10"
              />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <textarea
                className="input-field resize-none"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Optional tile description..."
              />
            </Field>
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-3 bg-red-900/20 px-3 py-2 rounded-lg border border-red-800/40">
              {error}
            </p>
          )}
          <div className="flex gap-3 mt-6 justify-end">
            <button onClick={() => setModal(null)} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={
                saving ||
                !form.name ||
                !form.category ||
                !form.size ||
                !form.finish ||
                !form.color ||
                !form.pricePerBox
              }
            >
              {saving
                ? "Saving..."
                : modal === "add"
                  ? "Add Tile"
                  : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Image Upload Modal ── */}
      {modal === "image" && (
        <Modal
          title="🖼️ Add Tile Image"
          onClose={() => setModal(selected ? "edit" : "add")}
        >
          <ImageUploadModal
            currentImage={form.imageUrl || undefined}
            onSave={(dataUrl) => {
              setForm((p) => ({ ...p, imageUrl: dataUrl }));
              setModal(selected ? "edit" : "add");
            }}
            onClose={() => setModal(selected ? "edit" : "add")}
          />
        </Modal>
      )}

      {/* ── Delete Modal ── */}
      {modal === "delete" && (
        <Modal title="🗑️ Delete Tile" onClose={() => setModal(null)}>
          <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-4 mb-5">
            <p className="text-red-400 font-semibold mb-1">
              ⚠️ This action cannot be undone
            </p>
            <p className="text-brand-muted text-sm">
              You are about to permanently delete{" "}
              <strong className="text-brand-text">{selected?.name}</strong> (
              {selected?.sku}). All associated stock logs will also be deleted.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModal(null)} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="btn-danger"
              disabled={saving}
            >
              {saving ? "Deleting..." : "Yes, Delete Tile"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── QR Modal ── */}
      {modal === "qr" && selected && (
        <Modal title="📱 Tile QR Code" onClose={() => setModal(null)}>
          <div className="flex flex-col items-center gap-5">
            {selected.imageUrl && (
              <div
                className="w-full rounded-xl overflow-hidden border border-brand-border bg-brand-black"
                style={{ height: 180 }}
              >
                <img
                  src={selected.imageUrl}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (
                      e.target as HTMLImageElement
                    ).parentElement!.style.display = "none";
                  }}
                />
              </div>
            )}
            <div
              className="bg-brand-black rounded-xl p-5 border-2 border-brand-purple/40"
              style={{ boxShadow: "0 0 20px rgba(124,58,237,0.2)" }}
            >
              {selected.qrCode ? (
                <img
                  src={selected.qrCode}
                  alt={`QR — ${selected.sku}`}
                  className="w-56 h-56 rounded"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-brand-muted text-sm">
                  No QR Code yet
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="font-bold text-brand-text text-lg">
                {selected.name}
              </p>
              <code className="text-sm text-brand-purple-light font-mono">
                {selected.sku}
              </code>
              <p className="text-xs text-brand-muted mt-1.5">
                {selected.size} cm · {selected.finish} · {selected.color} ·{" "}
                {selected.thickness}
              </p>
              <div className="mt-2">
                <span
                  className={`text-xs font-bold ${selected.stockQty <= selected.minStock ? "text-red-400" : "text-green-400"}`}
                >
                  {selected.stockQty} boxes in stock
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
                    {selected.sku}
                  </span>
                </p>
                <p>• Name: {selected.name}</p>
                <p>
                  • Category: {selected.category} · Size: {selected.size}
                </p>
                <p>
                  • Finish: {selected.finish} · Color: {selected.color}
                </p>
                <p>• Price: {formatCurrency(selected.pricePerBox)}/box</p>
              </div>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={downloadQR}
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
                  setModal(null);
                  openStock(selected);
                }}
                className="btn-secondary flex-1 justify-center"
              >
                Update Stock
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Stock Modal ── */}
      {modal === "stock" && selected && (
        <Modal
          title={`📦 Update Stock — ${selected.name}`}
          onClose={() => setModal(null)}
        >
          <div className="mb-5 p-4 bg-brand-black-4 rounded-xl border border-brand-border flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-muted">Current Stock</p>
              <p className="text-xs text-brand-muted font-mono mt-0.5">
                {selected.sku}
              </p>
            </div>
            <span
              className={`text-2xl font-bold ${selected.stockQty <= selected.minStock ? "text-red-400" : "text-green-400"}`}
            >
              {selected.stockQty} boxes
            </span>
          </div>
          <div className="space-y-4">
            <Field label="Transaction Type">
              <select
                className="input-field"
                value={stockForm.type}
                onChange={(e) =>
                  setStockForm((p) => ({ ...p, type: e.target.value }))
                }
              >
                <option value="ADD">➕ Add Stock (increase)</option>
                <option value="REDUCE">➖ Reduce Stock (decrease)</option>
                <option value="ADJUSTMENT">🔄 Set Exact Quantity</option>
              </select>
            </Field>
            <Field
              label={
                stockForm.type === "ADJUSTMENT"
                  ? "New Exact Quantity"
                  : "Quantity (Boxes)"
              }
            >
              <input
                type="number"
                min="0"
                className="input-field"
                value={stockForm.quantity}
                onChange={(e) =>
                  setStockForm((p) => ({ ...p, quantity: e.target.value }))
                }
                placeholder="Enter quantity"
                autoFocus
              />
            </Field>
            <Field label="Note (Optional)">
              <input
                className="input-field"
                value={stockForm.note}
                onChange={(e) =>
                  setStockForm((p) => ({ ...p, note: e.target.value }))
                }
                placeholder="e.g. New shipment from supplier"
              />
            </Field>
            {stockForm.quantity && stockForm.type !== "ADJUSTMENT" && (
              <div className="bg-brand-black-4 rounded-lg p-3 text-sm">
                <span className="text-brand-muted">New stock will be: </span>
                <span className="font-bold text-brand-purple-light">
                  {stockForm.type === "ADD"
                    ? selected.stockQty + parseInt(stockForm.quantity || "0")
                    : Math.max(
                        0,
                        selected.stockQty - parseInt(stockForm.quantity || "0"),
                      )}{" "}
                  boxes
                </span>
              </div>
            )}
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-3 bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          <div className="flex gap-3 mt-6 justify-end">
            <button onClick={() => setModal(null)} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleStock}
              className="btn-primary"
              disabled={saving || !stockForm.quantity}
            >
              {saving ? "Updating..." : "Update Stock"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function TileActionBtn({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-2 rounded-lg text-xs transition-all duration-150 ${danger ? "text-brand-muted hover:bg-red-900/30 hover:text-red-400" : "text-brand-muted hover:bg-brand-black-5 hover:text-brand-text"}`}
    >
      {children}
    </button>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div
        className="glass-card w-full max-w-2xl max-h-[92vh] flex flex-col"
        style={{
          boxShadow: "0 0 80px rgba(124,58,237,0.2), 0 0 40px rgba(0,0,0,0.6)",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border shrink-0">
          <h2 className="font-semibold text-brand-text text-lg">{title}</h2>
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
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-brand-muted mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
