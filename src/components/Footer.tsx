import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4">
        <div className="flex justify-center">
          <Link
            href="/client-portal"
            className="text-xs sm:text-sm text-slate-300 hover:text-white font-medium"
          >
            View Current Client Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
