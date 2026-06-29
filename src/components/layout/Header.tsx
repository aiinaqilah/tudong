"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import HeaderSearchBar from '@/components/layout/HeaderSearchBar';
import HeaderCategorySelector from '@/components/layout/HeaderCategorySelector';
import { useCartStore } from '@/stores/cart-store';
import { useShallow } from 'zustand/shallow';

const AnnouncementBar = () => {
  return (
    <div className="w-full bg-black py-2">
      <div className="container mx-auto flex items-center justify-center px-8">
        <span className="text-center text-sm font-medium tracking-wide text-white">
          FREE SHIPPING ON ORDERS OVER RM15.00 • FREE RETURNS
        </span>
      </div>
    </div>
  );
};

type HeaderProps = {
  categorySelector?: React.ReactNode;
};

const Header = ({ categorySelector }: HeaderProps) => {
  const router = useRouter();
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
        className={`w-full transform transition-transform duration-300 ease-in-out ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <AnnouncementBar />

        <div className="w-full flex justify-between items-center py-3 sm:py-4 bg-white/80 shadow-sm border-b border-gray-100 backdrop-blur-sm">
          <div className="flex justify-between items-center container mx-auto px-8 w-full">
            <div className="flex flex-1 justify-start items-center gap-4 sm:gap-6">
              <button className="text-gray-700 hover:text-gray-900 md:hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <nav className="hidden md:flex gap-4 lg:gap-6 text-sm font-medium">
                {categorySelector}
                <Link href="/sale">Sale</Link>
              </nav>
            </div>

            <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tight">
              TUDONG.COM
            </Link>
 
            <div className="flex flex-1 justify-end items-center gap-2 sm:gap-4">
              <HeaderSearchBar />

              {isPending ? (
                <div className="text-sm text-gray-700">Loading...</div>
              ) : user ? (
                <div className="flex items-center gap-2 sm:gap-4">
                  <Link
                    href="/dashboard"
                    className="text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 hidden md:block"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <React.Fragment>
                  <Link
                    href="/api/login"
                    className="text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/api/sign-up"
                    className="text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Sign Up
                  </Link>
                </React.Fragment>
              )}

              <button
                onClick={open}
                className="text-gray-700 hover:text-gray-900 relative"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] sm:text-xs w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;