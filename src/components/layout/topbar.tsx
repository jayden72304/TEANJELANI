import { logout } from "@/app/actions/auth";

export function Topbar({ userName }: { userName: string }) {
  return (
    <header className="flex h-16 items-center justify-end border-b border-slate-800 bg-slate-950 px-6">
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400">{userName}</span>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
