import Link from "next/link";
import { signOutAction } from "@/lib/auth/actions";
import { getAuthenticatedUser } from "@/lib/auth/server";

const navigation = [
  { href: "/dashboard", label: "Koonti" },
  { href: "/projects", label: "Projektit" },
  { href: "/time-entries", label: "Tunnit" },
  { href: "/reports", label: "Raportit" },
  { href: "/profile", label: "Profiili" },
  { href: "/admin", label: "Yllapito" }
];

export async function Header() {
  const user = await getAuthenticatedUser();

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
        <nav aria-label="Paavalikko">
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
            {user ? (
              <li>
                <form action={signOutAction}>
                  <button
                    className="inline-flex min-h-10 items-center rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[#eef5f3] hover:text-[var(--accent)]"
                    type="submit"
                  >
                    Kirjaudu ulos
                  </button>
                </form>
              </li>
            ) : (
              <li>
                <Link
                  className="inline-flex min-h-10 items-center rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[#eef5f3] hover:text-[var(--accent)]"
                  href="/login"
                >
                  Kirjaudu
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
