import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-2xl mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">403</h1>
        <h2 className="text-xl text-slate-300 mb-4">Unauthorized Access</h2>
        <p className="text-slate-400 mb-8 max-w-sm">You don&apos;t have permission to view this page. Please contact your administrator.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
