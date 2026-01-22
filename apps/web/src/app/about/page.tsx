'use client';

import { Shield, Zap, Lock, Users, MessageSquare, BarChart3, FileText } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const features = [
    {
      icon: Shield,
      title: 'Zero-Knowledge Proofs',
      description: 'Built on Aleo blockchain, utilizing zk-SNARKs for provable privacy without revealing sensitive data.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Client-side encryption and local computation ensure instant operations without server roundtrips.',
    },
    {
      icon: Lock,
      title: 'Complete Privacy',
      description: 'No tracking, no logging, no data collection. Your information never leaves your device unencrypted.',
    },
    {
      icon: Users,
      title: 'Open Source',
      description: 'Fully transparent codebase. Verify the security yourself or contribute to the project.',
    },
  ];

  const apps = [
    {
      icon: MessageSquare,
      name: 'PrivyMessage',
      description: 'Send anonymous messages with sender identity hidden via ZK proofs.',
      href: '/message',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: BarChart3,
      name: 'PrivyPoll',
      description: 'Create and vote on polls with complete voting anonymity.',
      href: '/poll',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      name: 'PrivyNotes',
      description: 'Store encrypted notes that only you can decrypt.',
      href: '/notes',
      gradient: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <header className="text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About Aleo Privacy Hub</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A comprehensive privacy platform built on Aleo blockchain, providing
            enterprise-grade privacy tools accessible to everyone.
          </p>
        </header>

        {/* Mission */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Mission</h2>
          <div className="p-8 bg-[#111118] border border-white/10 rounded-2xl">
            <p className="text-lg text-gray-300 leading-relaxed mb-4">
              Privacy is a fundamental human right, not a luxury. Aleo Privacy Hub
              democratizes access to privacy-preserving technologies by combining
              three essential tools into one seamless platform.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Powered by Aleo's zero-knowledge blockchain, we ensure that your
              data remains private by default, verifiable by cryptography, and
              controlled entirely by you.
            </p>
          </div>
        </section>

        {/* Apps Overview */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Applications</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {apps.map((app) => {
              const Icon = app.icon;
              return (
                <Link
                  key={app.name}
                  href={app.href}
                  className="group p-6 bg-[#111118] border border-white/10 rounded-2xl hover:border-white/20 transition"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{app.name}</h3>
                  <p className="text-sm text-gray-400">{app.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Aleo Privacy Hub?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="p-6 bg-[#111118] border border-white/10 rounded-2xl">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Technology */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Technology Stack</h2>
          <div className="p-6 bg-[#111118] border border-white/10 rounded-2xl">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                <div>
                  <strong className="text-white">Aleo Blockchain</strong>
                  <p className="text-sm text-gray-400">Layer-1 with native ZK proof support</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                <div>
                  <strong className="text-white">Leo Language</strong>
                  <p className="text-sm text-gray-400">ZK smart contract development</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                <div>
                  <strong className="text-white">Next.js 14</strong>
                  <p className="text-sm text-gray-400">Modern React with App Router</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                <div>
                  <strong className="text-white">Client-Side Encryption</strong>
                  <p className="text-sm text-gray-400">AES-256 before data leaves device</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buildathon */}
        <section className="text-center">
          <div className="p-8 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl">
            <h3 className="text-xl font-bold mb-2">Aleo Privacy Buildathon 2026</h3>
            <p className="text-gray-400">
              This project was built for the Aleo Privacy Buildathon, demonstrating
              the power of zero-knowledge proofs for everyday privacy applications.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
