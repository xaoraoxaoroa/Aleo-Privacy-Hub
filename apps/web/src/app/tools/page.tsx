'use client';

import { MessageSquare, BarChart3, FileText, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ToolsPage() {
  const tools = [
    {
      id: 'message',
      name: 'PrivyMessage',
      icon: MessageSquare,
      description: 'Send anonymous messages powered by zero-knowledge proofs',
      features: [
        'Sender identity completely hidden',
        'End-to-end encrypted messages',
        'On-chain delivery confirmation',
        'No metadata leakage',
      ],
      gradient: 'from-purple-500 to-pink-500',
      contract: 'privymsg_v1.aleo',
    },
    {
      id: 'poll',
      name: 'PrivyPoll',
      icon: BarChart3,
      description: 'Create and vote on polls with complete anonymity',
      features: [
        'Anonymous voting with ZK proofs',
        'Nullifier prevents double-voting',
        'Public aggregated results only',
        'Configurable poll duration',
      ],
      gradient: 'from-blue-500 to-cyan-500',
      contract: 'privypoll_v1.aleo',
    },
    {
      id: 'notes',
      name: 'PrivyNotes',
      icon: FileText,
      description: 'Store encrypted notes that only you can read',
      features: [
        'Client-side AES encryption',
        'Private records on Aleo',
        'Only owner can decrypt',
        'Pin important notes',
      ],
      gradient: 'from-emerald-500 to-teal-500',
      contract: 'privynotes_v1.aleo',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Tools</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Three powerful privacy applications built on Aleo blockchain
            with zero-knowledge proofs
          </p>
        </header>

        <div className="grid gap-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={`/${tool.id}`}
                className="group p-8 bg-[#111118] border border-white/10 rounded-2xl hover:border-white/20 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{tool.name}</h2>
                      <span className="px-2 py-0.5 text-xs font-mono bg-white/5 rounded text-gray-400">
                        {tool.contract}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-4">{tool.description}</p>
                    <div className="grid sm:grid-cols-2 gap-2 mb-4">
                      {tool.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center text-emerald-400 font-medium group-hover:text-emerald-300">
                      Open {tool.name}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Technical Info */}
        <div className="mt-12 p-6 bg-[#111118] border border-white/10 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">How Privacy Works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-emerald-400 mb-2">Leo Smart Contracts</h4>
              <p className="text-gray-400">
                Each tool has a Leo program deployed on Aleo Testnet that handles
                encrypted data and generates zero-knowledge proofs.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-emerald-400 mb-2">Private Records</h4>
              <p className="text-gray-400">
                Your data is stored as private records on-chain. Only the record
                owner can decrypt and view the contents.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-emerald-400 mb-2">Client-Side Encryption</h4>
              <p className="text-gray-400">
                All encryption happens in your browser before data leaves your
                device. Your keys never touch any server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
