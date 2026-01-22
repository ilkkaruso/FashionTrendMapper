import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fashion Trend Mapper",
  description: "Interactive visualization of current fashion trends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold">Fashion Trend Mapper</h1>
              <nav className="flex gap-6">
                <Link href="/" className="hover:text-gray-600 transition-colors">
                  Home
                </Link>
                <Link href="/archive" className="hover:text-gray-600 transition-colors">
                  Archive
                </Link>
                <Link href="/admin" className="hover:text-gray-600 transition-colors">
                  Admin
                </Link>
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <p>&copy; 2026 Fashion Trend Mapper</p>
                <p>We may earn commissions from featured products.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
