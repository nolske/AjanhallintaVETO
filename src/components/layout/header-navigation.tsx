"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/auth/actions";

export type HeaderNavigationItem = {
  href: string;
  label: string;
};

type HeaderNavigationProps = {
  items: HeaderNavigationItem[];
  isSignedIn: boolean;
};

const baseLinkClass =
  "inline-flex min-h-10 items-center rounded-md px-3 py-2 text-sm font-medium transition";
const inactiveLinkClass =
  "text-[var(--muted)] hover:bg-white hover:text-[var(--accent)]";
const activeLinkClass = "bg-white text-[var(--foreground)] shadow-sm";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNavigation({ items, isSignedIn }: HeaderNavigationProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Paavalikko">
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isActive = isActivePath(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`${baseLinkClass} ${
                  isActive ? activeLinkClass : inactiveLinkClass
                }`}
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        {isSignedIn ? (
          <li>
            <form action={signOutAction}>
              <button
                className={`${baseLinkClass} ${inactiveLinkClass}`}
                type="submit"
              >
                Kirjaudu ulos
              </button>
            </form>
          </li>
        ) : (
          <li>
            <Link
              className={`${baseLinkClass} ${
                isActivePath(pathname, "/login")
                  ? activeLinkClass
                  : inactiveLinkClass
              }`}
              href="/login"
            >
              Kirjaudu
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
