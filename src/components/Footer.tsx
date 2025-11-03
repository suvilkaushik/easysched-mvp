import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-center">
          <Link
            href="/client-portal"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Current Client Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}

