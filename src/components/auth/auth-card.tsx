import Link from "next/link";
import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footerHref?: string;
  footerLabel?: string;
};

export function AuthCard({
  title,
  description,
  children,
  footerHref,
  footerLabel
}: AuthCardProps) {
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">{title}</h1>
        <p className="mt-3 leading-7 text-[var(--muted)]">{description}</p>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        {children}
      </div>
      {footerHref && footerLabel ? (
        <Link className="text-sm font-semibold text-[var(--accent)]" href={footerHref}>
          {footerLabel}
        </Link>
      ) : null}
    </section>
  );
}
