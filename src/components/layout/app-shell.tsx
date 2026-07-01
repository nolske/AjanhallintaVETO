import Link from "next/link";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[var(--border)] bg-[var(--panel)] px-6 py-5">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>AjanhallintaVETO MVP</p>
          <Link className="font-medium text-[var(--accent)]" href="/reports">
            Raportit
          </Link>
        </div>
      </footer>
    </div>
  );
}
