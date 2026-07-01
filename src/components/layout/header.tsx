import Link from "next/link";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/time-entries", label: "Time" },
  { href: "/reports", label: "Reports" },
  { href: "/profile", label: "Profile" },
  { href: "/admin", label: "Admin" }
];

export function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--panel)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <Link
          className="text-lg font-bold text-[var(--foreground)]"
          href="/"
          aria-label="AjanhallintaVETO home"
        >
          AjanhallintaVETO
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap gap-2">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  className="inline-flex min-h-10 items-center rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[#eef5f3] hover:text-[var(--accent)]"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
