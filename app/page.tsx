import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const session = await getAuthSession();

  // Redirect logged-in users to their role dashboard
  if (session) {
    const roleRedirects: Record<string, string> = {
      ADMIN: "/admin/dashboard",
      WAREHOUSE_MANAGER: "/warehouse/stock",
      CUSTOMER: "/customer/products",
      DELIVERY_AGENT: "/delivery/orders",
    };
    redirect(roleRedirects[session.user.role] || "/login");
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute -top-60 -left-60 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-60 -right-60 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center">
          <svg className="w-9 h-9 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">StockFlow</h1>
          <p className="text-slate-400 text-sm">Inventory Management · Allo Health</p>
        </div>
      </div>

      <p className="text-slate-300 text-center text-lg max-w-xl mb-10 leading-relaxed">
        A concurrency-safe inventory and reservation management system with role-based access, real-time stock tracking, and auto-expiring reservations.
      </p>

      {/* Feature grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 w-full max-w-3xl">
        {[
          { label: "Role-Based Auth", icon: "🔐", desc: "4 roles, JWT sessions" },
          { label: "SELECT FOR UPDATE", icon: "⚡", desc: "Concurrency-safe" },
          { label: "Auto-Expiry Cron", icon: "⏱️", desc: "Every 1 minute" },
          { label: "Redis Idempotency", icon: "🔄", desc: "24h key TTL" },
        ].map((f) => (
          <div key={f.label} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 text-center backdrop-blur">
            <div className="text-2xl mb-2">{f.icon}</div>
            <p className="text-white text-xs font-semibold">{f.label}</p>
            <p className="text-slate-500 text-xs mt-0.5">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link
          href="/login"
          className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 font-semibold rounded-xl transition-all"
        >
          Create Account
        </Link>
      </div>

      <p className="mt-8 text-xs text-slate-600">Built for Allo Health · Assignment Submission</p>
    </div>
  );
}
