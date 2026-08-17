import { logout } from "@/app/actions/auth";
import { MobileNav } from "./mobile-nav";

export function Topbar({ userName }: { userName: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 md:px-6">
      <MobileNav />
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <span className="hidden text-sm text-slate-400 sm:inline">{userName}</span>
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
