"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

export default function DashboardNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row md:flex-col gap-1 py-2 md:py-0">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-2 md:py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "bg-red-500 text-white"
                : "text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
