"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
    >
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-slate-300"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500"
          placeholder="agent@example.com"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-slate-300"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500"
          placeholder="••••••••"
        />
      </div>
      {state?.error && (
        <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
