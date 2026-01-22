'use client';

import { useState } from 'react';
import { Shield, MessageSquare, BarChart3, FileText, Wallet, X, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { WalletMultiButton } from '@demox-labs/aleo-wallet-adapter-reactui';

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { publicKey, connected } = useWallet();

  const routes = [
    { href: '/', label: 'Home', icon: Shield },
    { href: '/message', label: 'PrivyMessage', icon: MessageSquare },
    { href: '/poll', label: 'PrivyPoll', icon: BarChart3 },
    { href: '/notes', label: 'PrivyNotes', icon: FileText },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Shield className="w-6 h-6 text-emerald-400" />
            <span className="font-bold text-lg hidden sm:block">Aleo Privacy Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {routes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.href ||
                (route.href !== '/' && pathname.startsWith(route.href));
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
                    isActive
                      ? 'bg-emerald-400/10 text-emerald-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {route.label}
                </Link>
              );
            })}
          </div>

          {/* Wallet Button - Using Leo Wallet Adapter */}
          <div className="flex items-center gap-3">
            <div className="wallet-adapter-button-wrapper">
              <WalletMultiButton />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#111118] border-t border-white/10">
            <div className="px-4 py-3 space-y-1">
              {routes.map((route) => {
                const Icon = route.icon;
                const isActive = pathname === route.href ||
                  (route.href !== '/' && pathname.startsWith(route.href));
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'px-3 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3',
                      isActive
                        ? 'bg-emerald-400/10 text-emerald-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {route.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Custom Styles for Leo Wallet Button */}
      <style jsx global>{`
        .wallet-adapter-button-wrapper .wallet-adapter-button {
          background: linear-gradient(to right, #10b981, #06b6d4) !important;
          border-radius: 0.5rem !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          padding: 0.5rem 1rem !important;
        }
        .wallet-adapter-button-wrapper .wallet-adapter-button:hover {
          opacity: 0.9 !important;
        }
        .wallet-adapter-modal-wrapper {
          background-color: rgba(0, 0, 0, 0.7) !important;
        }
        .wallet-adapter-modal {
          background-color: #111118 !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 1rem !important;
        }
        .wallet-adapter-modal-title {
          color: white !important;
        }
        .wallet-adapter-modal-list li {
          background-color: #0a0a0f !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .wallet-adapter-modal-list li:hover {
          background-color: rgba(16, 185, 129, 0.1) !important;
          border-color: rgba(16, 185, 129, 0.3) !important;
        }
      `}</style>
    </>
  );
}
