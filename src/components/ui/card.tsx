import clsx from "clsx";
import { ReactNode } from "react";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-slate-800 bg-slate-900/60 p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-slate-400">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
