"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ProductCategory } from "@/sanity.types";
import HeaderSearchBar from '@/components/layout/HeaderSearchBar';
import { useCartStore } from '@/stores/cart-store';
import { useShallow } from 'zustand/shallow';

const AnnouncementBar = () => {
  return (
    <div className="w-full bg-foreground py-2.5">
      <div className="container mx-auto flex items-center justify-center px-8">
        <span className="text-center text-[10px] sm:text-[11px] font-light uppercase tracking-[0.28em] text-background/90">
          Complimentary shipping over RM150 · Free returns
        </span>
      </div>
    </div>
  );
};

const navLinkClass =
  "relative text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:after:w-full";

type HeaderProps = {
  categorySelector?: React.ReactNode;
  categories?: ProductCategory[];
};

const Header = ({ categorySelector, categories = [] }: HeaderProps) => {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { data: session, isPending } = authClient.useSession();

  const [headerVisible, setHeaderVisible] = React.useState(true);
  const prevScrollY = React.useRef(0);

  const { open, getTotalItems } = useCartStore(
    useShallow((state) => ({
      open: state.open,
      getTotalItems: state.getTotalItems,
    }))
  );

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const atTop = currentScrollY < 10;
      const scrolledUp = currentScrollY < prevScrollY.current;

      if (atTop || scrolledUp) {
        setHeaderVisible(true);
      } else {
        setHeaderVisible(false);
      }

      prevScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  //sign out
  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  const user = session?.user;

  //header
  return (
    <header className="w-full sticky top-0 z-50">
      {/* sticky header */}
      <div
        className={`relative z-50 w-full transform transition-transform duration-300 ease-in-out ${
          headerVisible || mobileOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <AnnouncementBar />

        <div className="w-full flex justify-between items-center py-4 sm:py-5 bg-background/80 border-b border-border backdrop-blur-md">
          <div className="flex justify-between items-center container mx-auto px-6 sm:px-8 w-full">
            <div className="flex flex-1 justify-start items-center gap-5 sm:gap-8">
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                className="text-foreground/80 hover:text-foreground md:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>

              <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                {categorySelector}
                <Link href="/sale" className={navLinkClass}>Sale</Link>
              </nav>
            </div>

            <Link
              href="/"
              className="font-serif text-2xl sm:text-[28px] leading-none font-medium tracking-[0.18em] text-foreground"
            >
              TUDONG.COM
            </Link>

            <div className="flex flex-1 justify-end items-center gap-4 sm:gap-6">
              <HeaderSearchBar />

              {isPending ? (
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">···</div>
              ) : user ? (
                <div className="flex items-center gap-4 sm:gap-6">
                  <Link href="/dashboard" className={`hidden md:inline-block ${navLinkClass}`}>
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className={navLinkClass}>
                    Sign Out
                  </button>
                </div>
              ) : (
                <React.Fragment>
                  <Link href="/api/login" className={navLinkClass}>
                    Sign In
                  </Link>
                  <Link href="/api/sign-up" className={`hidden sm:inline-block ${navLinkClass}`}>
                    Sign Up
                  </Link>
                </React.Fragment>
              )}

              <button
                onClick={open}
                aria-label="Open cart"
                className="text-foreground/80 hover:text-foreground relative"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="relative z-50 md:hidden bg-background border-b border-border shadow-sm">
          <nav className="container mx-auto px-6 sm:px-8 py-3 flex flex-col">
            {categories.some((c) => c.slug?.current) && (
              <p className="pt-2 pb-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Categories
              </p>
            )}
            {categories.map((c) => {
              const slug = c.slug?.current;
              if (!slug) return null;
              return (
                <Link
                  key={c._id}
                  href={`/category/${slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 text-sm text-foreground/80 hover:text-foreground transition-colors"
                >
                  {c.title}
                </Link>
              );
            })}
            <div className="my-2.5 h-px bg-border" />
            <Link
              href="/sale"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-[11px] uppercase tracking-[0.18em] text-foreground/80 hover:text-foreground transition-colors"
            >
              Sale
            </Link>
            {user && (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 text-[11px] uppercase tracking-[0.18em] text-foreground/80 hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;