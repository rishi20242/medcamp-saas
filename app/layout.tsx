import type { Metadata } from "next";
import "./globals.css";
import PatientNotification from "./components/PatientNotification";
import Link from "next/link";
import HeaderLogo from "./components/HeaderLogo";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

export const metadata: Metadata = {
  title: "MedCamp | Premium Care",
  description: "Advanced multi-tenant Medical Camp Automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-['Outfit'] min-h-screen bg-slate-50 dark:bg-black print:bg-white text-slate-900 dark:text-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white antialiased transition-colors duration-300">
        <PatientNotification />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {/* Glassmorphism Header */}
        <header className="print:hidden sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-white/20 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              <HeaderLogo />
            </h1>
            <nav className="hidden md:block">
              <ul className="flex space-x-8 text-sm font-semibold text-slate-600">
                <li>
                  <Link href="/patient-portal" className="hover:text-indigo-600 transition-colors duration-300 relative group">
                    Report Retrieval (Patient Portal)
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            {/* Mobile Menu Button placeholder */}
            <div className="md:hidden flex items-center gap-4">
              <ThemeToggle />
              <button className="text-slate-600 hover:text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow w-full">
          {children}
        </main>

        <footer className="bg-white dark:bg-black border-t border-slate-200 dark:border-white/10 py-8 text-center text-slate-500 dark:text-slate-400 text-sm print:hidden transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6">
            &copy; {new Date().getFullYear()} MedCamp Automation. Crafted with precision.
          </div>
        </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
