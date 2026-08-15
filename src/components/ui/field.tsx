import { ReactNode } from "react";
import clsx from "clsx";

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={clsx("space-y-1", className)}>
      {/* Wrapping the control implicitly associates the label — no id/htmlFor
          wiring needed, and it stays correct for dynamically repeated rows. */}
      <label className="block text-sm font-medium text-slate-300">
        <span className="mb-1 block">{label}</span>
        {children}
      </label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 disabled:opacity-50";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(inputClass, props.className)} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return <textarea {...props} className={clsx(inputClass, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(inputClass, props.className)} />;
}
