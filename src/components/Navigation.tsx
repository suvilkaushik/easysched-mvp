"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      name: "Messages",
      href: "/messages",
      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    },
    {
      name: "Clients",
      href: "/clients",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
      <div className="flex flex-col flex-1 px-6 py-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-purple-900/60">
            <span className="text-lg font-bold text-white">E</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">EasySched</h1>
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              CRM Dashboard
            </p>
          </div>
        </div>

        {/* Nav links */}
        <div className="mt-8 space-y-1">
          {navItems.map((item) => {
            const normalizedPathname = pathname?.endsWith("/")
              ? pathname.slice(0, -1) || "/"
              : pathname;
            const normalizedHref =
              item.href === "/"
                ? "/"
                : item.href.endsWith("/")
                ? item.href.slice(0, -1)
                : item.href;
            const isActive = normalizedPathname === normalizedHref;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition 
                  ${
                    isActive
                      ? "bg-white/10 text-white shadow-inner"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Bottom user area */}
        <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Signed in as
          </span>
          {isLoaded ? (
            isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <button
                  aria-label="Sign in"
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-500 hover:bg-indigo-600 text-white shadow"
                >
                  Sign in
                </button>
              </SignInButton>
            )
          ) : (
            <div style={{ width: 40 }} />
          )}
        </div>
      </div>
    </nav>
  );
}

// Client-side sync: when a user signs in, call server to ensure Mongo has their record.
export function NavigationWithSync() {
  const { user } = useUser();
  useEffect(() => {
    if (user && user.id) {
      fetch("/api/sync-current-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user.id }),
      }).catch((e) => console.warn("sync-current-user failed", e));
    }
  }, [user]);

  return <Navigation />;
}
