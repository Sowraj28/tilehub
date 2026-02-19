# 🏗️ TileHub — Enterprise Tile Management System

A professional, MNC-level tile inventory management web application built with Next.js 14, TypeScript, Tailwind CSS, and PostgreSQL (Prisma).

## ✨ Features

### Admin Side
- 🔐 Secure JWT admin login
- 📦 Full tile CRUD (Add / Edit / Delete)
- 📱 Auto QR code generation (purple/black theme) on every create/edit/stock update
- 📊 Stock management (Add / Reduce / Exact Adjustment)
- 📋 Complete stock transaction history log
- 👥 Sub admin management (create, activate, deactivate, delete)
- 📈 Dashboard with live stats and low-stock alerts
- 🖥️ Responsive: desktop table view + mobile card grid

### Sub Admin Side  
- 🔑 Separate pass-key login
- 📊 Stock overview (view only)
- 📷 Live QR camera scanner (no app needed)
- 🛒 Export cart with quantity controls
- 📄 Auto PDF bill generation (styled black/purple)
- 📉 Stock auto-deducted after export
- 📁 Export history with PDF re-download

---

## 🚀 Quick Start (3 Commands)

### Step 1 — Setup Database
1. Go to [neon.tech](https://neon.tech) → Create free account → Create project
2. Copy the **Connection String** (starts with `postgresql://...`)
3. Edit `.env.local` and paste your database URL

### Step 2 — Install & Setup
\`\`\`bash
npm install
npx prisma db push
npm run dev
\`\`\`

### Step 3 — Create Super Admin
Open your browser and go to:
\`\`\`
http://localhost:3000/api/seed
\`\`\`
Send a **POST** request (or use curl):
\`\`\`bash
curl -X POST http://localhost:3000/api/seed
\`\`\`

You'll get back:
\`\`\`json
{
  "credentials": {
    "username": "superadmin",
    "password": "Admin@123"
  }
}
\`\`\`

### Step 4 — Login
- **Admin**: http://localhost:3000/admin/login → `superadmin` / `Admin@123`
- **Sub Admin**: http://localhost:3000/subadmin/login → (create from admin panel first)

---

## 🌐 Vercel Deployment

1. Push this project to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add Environment Variables in Vercel dashboard:
   - `DATABASE_URL` — your Neon.tech PostgreSQL URL
   - `JWT_SECRET` — any long random string (32+ chars)
   - `NEXT_PUBLIC_APP_URL` — your Vercel URL
4. Deploy → After deploy, hit `https://your-app.vercel.app/api/seed` (POST once)
5. Login and **delete the seed route** for security

---

## 📁 Project Structure

\`\`\`
tilehub/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── admin/             # Admin pages (login, dashboard, products, stock, sub-admins)
│   │   ├── subadmin/          # Sub admin pages (login, dashboard, scan, exports)
│   │   └── api/               # API routes
│   │       ├── auth/          # Login / logout
│   │       ├── tiles/         # Tile CRUD
│   │       ├── stock/         # Stock management
│   │       ├── sub-admins/    # Sub admin management
│   │       ├── exports/       # Export bills
│   │       └── seed/          # One-time admin setup
│   ├── lib/
│   │   ├── prisma.ts          # Database client
│   │   ├── auth.ts            # JWT helpers
│   │   └── utils.ts           # QR generation, formatting
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── middleware.ts          # Route protection
├── .env.local                 # Your environment variables
├── package.json
├── tailwind.config.ts
└── tsconfig.json
\`\`\`

---

## 🔑 Default Credentials

| Role | URL | Username | Password |
|------|-----|----------|----------|
| Super Admin | /admin/login | superadmin | Admin@123 |
| Sub Admin | /subadmin/login | (create in admin panel) | (you set it) |

---

## 🛡️ Security Notes

1. Change `Admin@123` password after first login (update in DB)
2. Delete `/src/app/api/seed/route.ts` after creating admin
3. Set a strong `JWT_SECRET` in production
4. All routes are protected via middleware + HttpOnly cookies

---

## 🎨 Theme

- Background: `#0A0A0F` (deep black)
- Accent: `#7C3AED` (purple)
- Text: `#E2E2F0`
- Border: `#2D2D3A`

---

## 📦 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.2.5 | Full-stack React framework |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3.4 | Styling |
| Prisma | 5.16 | ORM / Database |
| PostgreSQL | — | Database (via Neon.tech) |
| bcryptjs | 2.4 | Password hashing |
| jsonwebtoken | 9 | JWT auth |
| qrcode | 1.5 | QR generation |
| jsQR | 1.4 | QR scanning |
| jsPDF + autoTable | 2.5 | PDF export |

---

Made with ❤️ — TileHub Enterprise Edition
