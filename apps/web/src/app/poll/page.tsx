'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, Plus, Vote, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { pollApi } from '@/lib/api';

interface Poll {
  id: string;
  pollId: string;
  question: string;
  options: string[];
  votes: any[];
  isActive: boolean;
  createdAt: string;
}

export default function PollPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      const data = await pollApi.getAll();
      setPolls(data);
    } catch (error) {
      console.error('Failed to load polls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">PrivyPoll</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Create and vote on polls with complete anonymity.
            Your vote is cryptographically hidden.
          </p>
        </div>

        {/* Create Button */}
        <div className="mb-8">
          <Link
            href="/poll/create"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-medium hover:opacity-90 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Poll
          </Link>
        </div>

        {/* Active Polls */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Polls</h2>
          {isLoading ? (
            <div className="p-12 bg-[#111118] border border-white/10 rounded-2xl flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : polls.length === 0 ? (
            <div className="p-12 bg-[#111118] border border-white/10 rounded-2xl text-center">
              <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No polls yet</p>
              <p className="text-sm text-gray-500">Create the first anonymous poll!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {polls.map((poll) => (
                <Link
                  key={poll.id}
                  href={`/poll/${poll.pollId}`}
                  className="group p-6 bg-[#111118] border border-white/10 rounded-2xl hover:border-blue-500/50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium group-hover:text-blue-400 transition">
                        {poll.question}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {poll.options.length} options • {poll.votes.length} votes
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      poll.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {poll.isActive ? 'Active' : 'Ended'}
                    </div>
                  </div>
                  <div className="flex items-center text-blue-400 text-sm font-medium mt-4">
                    {poll.isActive ? 'Vote Now' : 'View Results'}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="p-6 bg-[#111118] border border-white/10 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold">How Anonymous Voting Works</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 text-blue-400 font-bold">
                1
              </div>
              <h4 className="font-medium mb-1">Select Option</h4>
              <p className="text-sm text-gray-400">
                Choose your answer. It never leaves your device unencrypted.
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 text-blue-400 font-bold">
                2
              </div>
              <h4 className="font-medium mb-1">ZK Proof</h4>
              <p className="text-sm text-gray-400">
                A nullifier prevents double voting without revealing your choice.
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 text-blue-400 font-bold">
                3
              </div>
              <h4 className="font-medium mb-1">Anonymous Tally</h4>
              <p className="text-sm text-gray-400">
                Only aggregate results are visible. Individual votes stay hidden.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
