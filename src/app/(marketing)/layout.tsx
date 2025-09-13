import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                LegalForm AI
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                About
              </Link>
              <Link
                href="/demo"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Try Demo
              </Link>
              <Link
                href="/history"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                History
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
