'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, Send, Inbox, Shield, ArrowRight } from 'lucide-react';

export default function MessagePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">PrivyMessage</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Send anonymous messages powered by zero-knowledge proofs.
            Your identity stays completely hidden.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link
            href="/message/send"
            className="group p-8 bg-[#111118] border border-white/10 rounded-2xl hover:border-purple-500/50 transition"
          >
            <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <Send className="w-7 h-7 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition">
              Send Message
            </h2>
            <p className="text-gray-400 mb-4">
              Send an encrypted message to any Aleo address anonymously.
            </p>
            <div className="flex items-center text-purple-400 text-sm font-medium">
              Start Sending
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/message/inbox"
            className="group p-8 bg-[#111118] border border-white/10 rounded-2xl hover:border-purple-500/50 transition"
          >
            <div className="w-14 h-14 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-pink-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-pink-400 transition">
              View Inbox
            </h2>
            <p className="text-gray-400 mb-4">
              Check your received messages. Only you can decrypt them.
            </p>
            <div className="flex items-center text-pink-400 text-sm font-medium">
              Open Inbox
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* How It Works */}
        <div className="p-6 bg-[#111118] border border-white/10 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold">How It Works</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 text-purple-400 font-bold">
                1
              </div>
              <h4 className="font-medium mb-1">Write Message</h4>
              <p className="text-sm text-gray-400">
                Enter the recipient's address and your message.
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 text-purple-400 font-bold">
                2
              </div>
              <h4 className="font-medium mb-1">ZK Encryption</h4>
              <p className="text-sm text-gray-400">
                Message is encrypted. A ZK proof hides your identity.
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 text-purple-400 font-bold">
                3
              </div>
              <h4 className="font-medium mb-1">Anonymous Delivery</h4>
              <p className="text-sm text-gray-400">
                Recipient gets message. Sender identity stays hidden.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
