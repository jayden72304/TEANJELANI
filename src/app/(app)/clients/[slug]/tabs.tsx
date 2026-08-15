"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function ClientTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/clients/${slug}`;
  const tabs = [
    { href: base, label: "Profile" },
    { href: `${base}/contracts`, label: "Contracts" },
    { href: `${base}/marketing`, label: "Marketing & Leads" },
    { href: `${base}/media`, label: "Media Monitoring" },
  ];

  return (
    <div className="flex gap-1 border-b border-slate-800">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition",
              active
                ? "border-orange-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
