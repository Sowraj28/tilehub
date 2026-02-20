import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4 relative overflow-hidden">
      {/* ── Layered background atmosphere ── */}
      {/* Deep grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.06) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top radial glow */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: "-120px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "500px",
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, rgba(79,27,180,0.08) 40%, transparent 70%)",
        }}
      />

      {/* Bottom-left accent glow */}
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: "-80px",
          left: "-100px",
          width: "500px",
          height: "400px",
          background:
            "radial-gradient(ellipse at center, rgba(99,40,200,0.12) 0%, transparent 65%)",
        }}
      />

      {/* Bottom-right accent glow */}
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: "-60px",
          right: "-80px",
          width: "400px",
          height: "350px",
          background:
            "radial-gradient(ellipse at center, rgba(139,92,246,0.1) 0%, transparent 65%)",
        }}
      />

      {/* Subtle noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Horizontal shimmer line */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: "50%",
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.15) 30%, rgba(167,139,250,0.3) 50%, rgba(124,58,237,0.15) 70%, transparent 100%)",
        }}
      />

      {/* ── Main content ── */}
      <div className="relative w-full max-w-sm sm:max-w-md z-10">
        {/* Logo + Brand */}
        <div className="text-center mb-10">
          {/* Animated logo container */}
          <div className="relative inline-flex mb-6">
            {/* Outer ring glow */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: "rgba(124,58,237,0.15)",
                boxShadow:
                  "0 0 0 1px rgba(124,58,237,0.3), 0 0 40px rgba(124,58,237,0.4), 0 0 80px rgba(124,58,237,0.15)",
                borderRadius: "18px",
              }}
            />
            <div
              className="relative flex items-center justify-center w-[72px] h-[72px] rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(79,27,180,0.4) 100%)",
                border: "1px solid rgba(167,139,250,0.3)",
              }}
            >
              {/* Tile grid icon */}
              <svg viewBox="0 0 24 24" className="w-9 h-9" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="7"
                  height="7"
                  rx="1.5"
                  fill="rgba(167,139,250,0.9)"
                />
                <rect
                  x="14"
                  y="3"
                  width="7"
                  height="7"
                  rx="1.5"
                  fill="rgba(139,92,246,0.7)"
                />
                <rect
                  x="3"
                  y="14"
                  width="7"
                  height="7"
                  rx="1.5"
                  fill="rgba(139,92,246,0.7)"
                />
                <rect
                  x="14"
                  y="14"
                  width="7"
                  height="7"
                  rx="1.5"
                  fill="rgba(167,139,250,0.9)"
                />
              </svg>
            </div>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-black tracking-[-0.03em] mb-2"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              background:
                "linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            TileHub
          </h1>
          <p
            className="text-xs sm:text-sm tracking-[0.2em] uppercase font-medium"
            style={{ color: "rgba(167,139,250,0.6)" }}
          >
            Enterprise Management
          </p>
        </div>

        {/* Card */}
        <div
          className="relative rounded-2xl p-6 sm:p-8"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(124,58,237,0.2)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.03) inset, 0 32px 64px rgba(0,0,0,0.6), 0 0 40px rgba(124,58,237,0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Card top accent line */}
          <div
            className="absolute top-0 left-8 right-8 h-px rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent)",
            }}
          />

          {/* Heading */}
          <div className="text-center mb-7">
            <p className="text-white font-semibold text-lg tracking-tight mb-1">
              Select Your Portal
            </p>
            <p style={{ color: "rgba(148,163,184,0.7)", fontSize: "13px" }}>
              Sign in to access your workspace
            </p>
          </div>

          {/* Divider */}
          <div
            className="mb-6 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(124,58,237,0.25), transparent)",
            }}
          />

          {/* Portal buttons */}
          <div className="space-y-3">
            {/* Admin Portal */}
            <Link
              href="/admin/login"
              className="group relative flex items-center gap-3 w-full px-5 py-4 rounded-xl transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(99,40,200,0.25) 100%)",
                border: "1px solid rgba(124,58,237,0.35)",
                boxShadow: "0 4px 16px rgba(124,58,237,0.12)",
              }}
            >
              {/* Hover overlay */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(99,40,200,0.35) 100%)",
                }}
              />

              {/* Icon */}
              <div
                className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-lg"
                style={{
                  background: "rgba(124,58,237,0.3)",
                  border: "1px solid rgba(167,139,250,0.3)",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <rect
                    x="3"
                    y="3"
                    width="6"
                    height="6"
                    rx="1"
                    fill="rgba(196,181,253,0.9)"
                  />
                  <rect
                    x="15"
                    y="3"
                    width="6"
                    height="6"
                    rx="1"
                    fill="rgba(167,139,250,0.7)"
                  />
                  <rect
                    x="3"
                    y="15"
                    width="6"
                    height="6"
                    rx="1"
                    fill="rgba(167,139,250,0.7)"
                  />
                  <rect
                    x="15"
                    y="15"
                    width="6"
                    height="6"
                    rx="1"
                    fill="rgba(196,181,253,0.9)"
                  />
                </svg>
              </div>

              {/* Text */}
              <div className="relative flex-1 text-left">
                <p className="text-white font-semibold text-sm">Admin Portal</p>
                <p style={{ color: "rgba(167,139,250,0.6)", fontSize: "11px" }}>
                  Full management access
                </p>
              </div>

              {/* Arrow */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="relative w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: "rgba(167,139,250,0.5)" }}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>

            {/* Sub Admin Portal */}
            <Link
              href="/subadmin/login"
              className="group relative flex items-center gap-3 w-full px-5 py-4 rounded-xl transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Hover overlay */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",
                }}
              />

              {/* Icon */}
              <div
                className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  className="w-5 h-5"
                  style={{ color: "rgba(148,163,184,0.8)" }}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>

              {/* Text */}
              <div className="relative flex-1 text-left">
                <p
                  className="font-semibold text-sm"
                  style={{ color: "rgba(226,232,240,0.85)" }}
                >
                  Sub Admin Portal
                </p>
                <p style={{ color: "rgba(100,116,139,0.8)", fontSize: "11px" }}>
                  Stock &amp; inventory access
                </p>
              </div>

              {/* Arrow */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="relative w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: "rgba(100,116,139,0.4)" }}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </div>

          {/* Bottom badge */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "rgba(34,197,94,0.7)" }}
            />
            <p style={{ color: "rgba(100,116,139,0.6)", fontSize: "11px" }}>
              Secure · Encrypted · Enterprise-grade
            </p>
          </div>
        </div>

        {/* Footer */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: "rgba(71,85,105,0.6)" }}
        >
          TileHub Enterprise © {new Date().getFullYear()} — All rights reserved
        </p>
      </div>
    </div>
  );
}
