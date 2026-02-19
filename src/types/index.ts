export interface AdminUser {
  id: string;
  username: string;
  role: string;
}

export interface SubAdminUser {
  id: string;
  username: string;
  displayName: string;
}

export interface Tile {
  id: string;
  name: string;
  sku: string;
  category: string;
  size: string;
  finish: string;
  color: string;
  thickness: string;
  pricePerBox: number;
  stockQty: number;
  minStock: number;
  qrCode?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubAdmin {
  id: string;
  username: string;
  passKey: string;
  displayName: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface StockLog {
  id: string;
  tileId: string;
  tile?: { name: string; sku: string };
  type: 'ADD' | 'REDUCE' | 'SALE' | 'ADJUSTMENT';
  quantity: number;
  note?: string | null;
  doneBy: string;
  createdAt: string;
}

export interface Export {
  id: string;
  subAdminId: string;
  subAdmin?: { displayName: string; username: string };
  totalBoxes: number;
  totalValue: number;
  note?: string | null;
  createdAt: string;
  items: ExportItem[];
}

export interface ExportItem {
  id: string;
  tileId: string;
  tile?: Tile;
  quantity: number;
  price: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
