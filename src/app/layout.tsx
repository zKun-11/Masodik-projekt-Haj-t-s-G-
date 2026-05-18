import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hajítás kalkulátor',
  description: 'Next.js + Tailwind fizika projekt',
};

const navLinks = [
  { href: '/', label: 'Főoldal' },
  { href: '/calc', label: 'Kalkulátor' },
  { href: '/creators', label: 'Készítők' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body>
        <header className="sticky top-0 z-50 border-b border-purple-100 bg-white/80 shadow-sm shadow-sky-100/70 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-slate-950">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-br from-purple-600 to-sky-500 text-white shadow-lg shadow-purple-200">
                H
              </span>
              <span>Hajítás projekt</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-purple-200 bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-linear-to-r hover:from-purple-600 hover:to-sky-500 hover:text-white hover:shadow-lg hover:shadow-sky-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
