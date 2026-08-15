"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "home" },
  { href: "/clients", label: "Clients", icon: "users" },
  { href: "/contracts", label: "Contracts", icon: "doc" },
  { href: "/leads", label: "Leads & Deals", icon: "handshake" },
  { href: "/monitoring", label: "Media Monitoring", icon: "eye" },
  { href: "/analytics", label: "Brand Analytics", icon: "chart" },
] as const;

function Icon({ name }: { name: string }) {
  const common = "h-4.5 w-4.5";
  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path
            d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M3.5 19c.7-3 2.8-4.5 5.5-4.5s4.8 1.5 5.5 4.5M15.5 8.2a2.8 2.8 0 1 1 2.8 2.8M16.5 14.6c2.4.4 4 1.9 4.5 4.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "doc":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path
            d="M7 3.5h7l4 4V20a.6.6 0 0 1-.6.6H7A.6.6 0 0 1 6.4 20V4.1a.6.6 0 0 1 .6-.6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M14 3.5V8h4M9 12.5h6M9 15.8h6M9 9.2h2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "handshake":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path
            d="m2.5 12 4-3.7 4 2.7 3-2.7 4 1.8 3.5 3.4-3 3-2-2-3.5 3-4-3.3-2.5 2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "eye":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path
            d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path
            d="M4 20V10M10 20V4M16 20v-7M22 20H2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-60 flex-col gap-1 border-r border-slate-800 bg-slate-950 p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">
          CRM
        </div>
        <span className="text-sm font-semibold text-white">Agent Client Hub</span>
      </div>
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-orange-500/10 text-orange-400"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            )}
          >
            <Icon name={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
