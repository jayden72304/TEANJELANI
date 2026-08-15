import Link from "next/link";
import clsx from "clsx";
import { ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:pointer-events-none px-3 py-2";

const variants = {
  primary: "bg-orange-500 text-white hover:bg-orange-400",
  secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
  ghost: "text-slate-300 hover:bg-slate-800",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

type Variant = keyof typeof variants;

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(base, variants[variant], className)}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  href,
  variant = "primary",
  className,
}: {
  children: ReactNode;
  href: string;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link href={href} className={clsx(base, variants[variant], className)}>
      {children}
    </Link>
  );
}
