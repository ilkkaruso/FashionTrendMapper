import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fashion Bubbles",
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
          <header className="bg-black text-white">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <h1 className="text-xl font-bold">Fashion Bubbles</h1>
              <nav className="flex gap-6">
                <Link href="/" className="hover:text-gray-300 transition-colors">
                  Home
                </Link>
                <Link href="/archive" className="hover:text-gray-300 transition-colors">
                  Archive
                </Link>
                <Link href="/admin" className="hover:text-gray-300 transition-colors">
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
          <footer className="bg-black text-white">
            <div className="container mx-auto px-4 py-3">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <p>&copy; 2026 Fashion Bubbles</p>
                <p>We may earn commissions from featured products.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
