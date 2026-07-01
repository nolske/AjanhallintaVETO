import type { ReactNode } from "react";

type PlaceholderPanelProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PlaceholderPanel({
  title,
  description,
  children
}: PlaceholderPanelProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">
          {description}
        </p>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
