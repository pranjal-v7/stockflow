"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Truck, LogOut } from "lucide-react";

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <aside className="w-64 bg-slate-800 border-r border-slate-700/50 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500/20 border border-orange-500/30 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">StockFlow</p>
              <p className="text-xs text-slate-500">Delivery Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <Link href="/delivery/orders" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname.startsWith("/delivery/orders") ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"}`}>
            <Truck className="w-4 h-4" /> My Deliveries
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-300 font-semibold text-sm">
              {session?.user?.name?.[0]?.toUpperCase() || "D"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
              <p className="text-xs text-slate-500">Delivery Agent</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
