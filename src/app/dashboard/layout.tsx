import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession } from "@/actions/auth";
import DashboardNav from "@/components/dashboard/DashboardNav";

const userLinks = [
  { href: "/dashboard/user", label: "Overview" },
  { href: "/dashboard/user/orders", label: "My Orders" },
  { href: "/dashboard/user/favorites", label: "Favourites" },
  { href: "/dashboard/user/profile", label: "Profile" },
];

const sellerLinks = [
  { href: "/dashboard/seller", label: "Overview" },
  { href: "/dashboard/seller/products", label: "My Products" },
  { href: "/dashboard/seller/orders", label: "Orders" },
];

const adminLinks = [
  { href: "/dashboard/admin", label: "Overview" },
  { href: "/dashboard/admin/users", label: "Users" },
  { href: "/dashboard/admin/orders", label: "All Orders" },
  { href: "/dashboard/admin/applications", label: "Applications" },
];

function roleLinks(role: string) {
  if (role === "admin") return adminLinks;
  if (role === "seller") return sellerLinks;
  return userLinks;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentSession();
  if (!user) redirect("/api/login");

  const role = (user as { role?: string }).role ?? "user";
  const links = roleLinks(role);

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar / top bar */}
      <aside className="w-full md:w-60 md:shrink-0 bg-gray-900 flex flex-col md:min-h-screen">
        {/* Brand bar */}
        <div className="bg-black px-4 py-3 text-center">
          <Link href="/" className="text-white text-sm font-bold tracking-widest uppercase">
            TUDONG.COM
          </Link>
        </div>

        {/* User info — full on desktop, compact row on mobile */}
        <div className="hidden md:block px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.name ?? "User"}</p>
              <p className="text-gray-400 text-xs truncate">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="md:hidden flex items-center gap-3 px-4 py-2.5 border-b border-white/10">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <p className="text-white text-sm font-semibold truncate flex-1">{user.name ?? "User"}</p>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">{role}</span>
        </div>

        {/* Role label — desktop only */}
        <div className="hidden md:block px-4 pt-5 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">{role}</p>
        </div>

        {/* Nav — horizontal scroll on mobile, vertical on desktop */}
        <div className="px-3 md:flex-1 overflow-x-auto">
          <DashboardNav links={links} />
        </div>

        {/* Footer — desktop only */}
        <div className="hidden md:block px-3 py-4 border-t border-white/10">
          <Link
            href="/"
            className="block rounded-md px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}
