import clsx from "clsx";
import { ReactNode } from "react";

const tones = {
  slate: "bg-slate-800 text-slate-300",
  green: "bg-emerald-950 text-emerald-400 ring-1 ring-inset ring-emerald-800",
  orange: "bg-orange-950 text-orange-400 ring-1 ring-inset ring-orange-800",
  red: "bg-red-950 text-red-400 ring-1 ring-inset ring-red-800",
  blue: "bg-blue-950 text-blue-400 ring-1 ring-inset ring-blue-800",
  yellow: "bg-yellow-950 text-yellow-400 ring-1 ring-inset ring-yellow-800",
  purple: "bg-purple-950 text-purple-400 ring-1 ring-inset ring-purple-800",
};

export type BadgeTone = keyof typeof tones;

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
