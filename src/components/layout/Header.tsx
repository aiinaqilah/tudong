"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const AnnouncementBar = () => {
  return (
    <div className="w-full bg-white py-2">
      <div className="container mx-auto flex items-center justify-center px-8">
        <span className="text-center text-sm font-medium tracking-wide text-white">
          FREE SHIPPING ON ORDERS OVER $15.00 • FREE RETURNS
        </span>
      </div>
    </div>
  );
};

const Header = () => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [isOpen, setIsOpen] = React.useState(false);
  const [prevScrollY, setPrevScrollY] = useState<number>(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrolledUp = currentScrollY < prevScrollY;

      if (scrolledUp) {
        setIsOpen(true);
      } else if (currentScrollY > 100) {
        setIsOpen(false);
      }

      setPrevScrollY(currentScrollY);
    };

    setPrevScrollY(window.scrollY);

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollY]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  const user = session?.user;

  return (
    <header className="w-full sticky top-0 z-50">
      {/* sticky header */}
      <div
        className={`w-full transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <AnnouncementBar />

        <div className="w-full flex justify-between items-center py-3 sm:py-4 bg-red/50 shadow-sm border-b border-gray-80 backdrop-blur-sm">
          <div className="flex justify-between items-center container mx-auto px-8 w-full">
            <div className="flex flex-1 justify-start items-center gap-4 sm:gap-6">
              <button className="text-white-700 hover:text-gray-900 md:hidden">
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
                <Link href="/">Shop</Link>
                <Link href="/">New Arrivals</Link>
                <Link href="/">Sale</Link>
              </nav>
            </div>

            <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tight">
              TUDONG
            </Link>

            <div className="flex flex-1 justify-end items-center gap-2 sm:gap-4">
              <button className="text-cream-700 hover:text-pink-900 hidden sm:block">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {isPending ? (
                <div className="text-sm text-gray-700">Loading...</div>
              ) : user ? (
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="text-sm text-gray-700 hidden md:block">
                    {user.email}
                  </span>
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
                    href="/auth/sign-in"
                    className="text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Sign Up
                  </Link>
                </React.Fragment>
              )}

              <button className="text-gray-700 hover:text-gray-900 relative">
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
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] sm:text-xs w-3.5 h-3.5 sm:h-4 sm:w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;