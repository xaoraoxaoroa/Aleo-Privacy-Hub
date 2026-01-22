'use client';

import { MessageSquare, BarChart3, FileText, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const apps = [
    {
      id: 'message',
      name: 'PrivyMessage',
      icon: MessageSquare,
      description: 'Send anonymous messages. Your identity stays completely hidden with ZK proofs.',
      gradient: 'from-purple-500 to-pink-500',
      features: ['Anonymous sender identity', 'End-to-end encrypted', 'On-chain delivery proof'],
    },
    {
      id: 'poll',
      name: 'PrivyPoll',
      icon: BarChart3,
      description: 'Create and vote on polls with complete anonymity. Votes are cryptographically hidden.',
      gradient: 'from-blue-500 to-cyan-500',
      features: ['Anonymous voting', 'Nullifier prevents double-voting', 'Public result aggregation'],
    },
    {
      id: 'notes',
      name: 'PrivyNotes',
      icon: FileText,
      description: 'Store encrypted notes that only you can read. Private by default.',
      gradient: 'from-emerald-500 to-teal-500',
      features: ['Client-side encryption', 'Only owner can decrypt', 'Secure cloud backup'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-8">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Aleo Privacy Hub
          </h1>
          <p className="text-xl md:text-2xl text-white mb-4">
            3 Privacy Tools. 1 Platform. Zero Knowledge.
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Built on Aleo blockchain, leveraging zero-knowledge proofs to ensure
            complete privacy for your digital life. No tracking. No exposure. Just privacy.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full">Aleo Testnet</span>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full">Leo Smart Contracts</span>
            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full">ZK Proofs</span>
          </div>
        </div>
      </section>

      {/* Apps Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <Link
                key={app.id}
                href={`/${app.id}`}
                className="group p-6 bg-[#111118] border border-white/10 rounded-2xl hover:border-white/20 transition-all"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{app.name}</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{app.description}</p>
                <ul className="space-y-2 mb-4">
                  {app.features.map((feature, i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center text-sm font-medium text-emerald-400 group-hover:text-emerald-300">
                  Open App
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How ZK Works Section */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 bg-[#111118] border border-white/10 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">How Zero-Knowledge Privacy Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400 font-bold">
                  1
                </div>
                <h4 className="font-medium mb-1">Client-Side</h4>
                <p className="text-sm text-gray-400">All encryption happens in your browser</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400 font-bold">
                  2
                </div>
                <h4 className="font-medium mb-1">ZK Proof</h4>
                <p className="text-sm text-gray-400">Prove validity without revealing data</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400 font-bold">
                  3
                </div>
                <h4 className="font-medium mb-1">On-Chain</h4>
                <p className="text-sm text-gray-400">Encrypted data stored on Aleo</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400 font-bold">
                  4
                </div>
                <h4 className="font-medium mb-1">Only You</h4>
                <p className="text-sm text-gray-400">Decrypt with your private key</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 pb-12">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          <p>Built for Aleo Privacy Buildathon 2026</p>
          <p className="mt-2">Powered by Aleo blockchain and Leo smart contracts</p>
        </div>
      </footer>
    </div>
  );
}
