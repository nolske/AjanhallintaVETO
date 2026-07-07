import Link from "next/link";
import { canAccessAdminArea } from "@/lib/admin/authz";
import { getAuthenticatedUser, getCurrentProfile } from "@/lib/auth/server";
import { HeaderNavigation } from "@/components/layout/header-navigation";

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
  const profile = user ? await getCurrentProfile(user.id) : null;
  const visibleNavigation = navigation.filter(
    (item) => item.href !== "/admin" || canAccessAdminArea(profile?.role)
  );

  return (
    <header
      className="border-b border-[var(--border)]"
      style={{ backgroundColor: "rgb(78 0 142 / 50%)" }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <Link
          className="text-lg font-bold text-[var(--foreground)]"
          href="/"
          aria-label="AjanhallintaVETO home"
        >
          AjanhallintaVETO
        </Link>
        <HeaderNavigation items={visibleNavigation} isSignedIn={Boolean(user)} />
      </div>
    </header>
  );
}
