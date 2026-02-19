import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TileHub — Enterprise Tile Management',
  description: 'Professional tile inventory and stock management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-brand-black min-h-screen antialiased">{children}</body>
    </html>
  );
}
