"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navigation() {
  const pathname = usePathname();

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
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">EasySched</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                // Normalize pathname for comparison (handle trailing slashes)
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
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
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
          </div>
          <div className="flex items-center space-x-4">
            {/* Auth controls on the right */}
            <AuthControls />
          </div>
        </div>
      </div>
    </nav>
  );
}

function AuthControls() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-gray-700">
        {session.user?.name || session.user?.email}
      </span>
      <button
        onClick={() => signOut()}
        className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50"
      >
        Sign Out
      </button>
    </div>
  );
}
