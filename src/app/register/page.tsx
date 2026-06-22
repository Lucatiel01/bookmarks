"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/actions/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Create account</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Start saving bookmarks in seconds.</p>
          <form action={action} className="mt-6 space-y-4">
            <input
              name="name"
              type="text"
              placeholder="Name"
              required
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-indigo-400"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-indigo-400"
            />
            <input
              name="password"
              type="password"
              placeholder="Password (min 6 chars)"
              required
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-indigo-400"
            />
            {state?.error && (
              <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              {pending ? "Creating…" : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
