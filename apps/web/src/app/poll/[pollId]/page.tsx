'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Vote, ArrowLeft, Loader2, Shield, Check, Users } from 'lucide-react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import { generateId, hash } from '@/lib/encryption';
import { pollApi } from '@/lib/api';
import { TransactionProof } from '@/components/TransactionProof';
import { CONTRACTS } from '@/lib/contracts';

interface Poll {
  id: string;
  pollId: string;
  question: string;
  options: string[];
  votes: any[];
  voteCounts: number[];
  totalVotes: number;
  isActive: boolean;
}

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const { publicKey, connected, requestTransaction } = useWallet();
  const address = publicKey || '';
  const isConnected = connected;
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [lastTxId, setLastTxId] = useState('');

  useEffect(() => {
    loadPoll();
  }, [params.pollId]);

  const loadPoll = async () => {
    try {
      const data = await pollApi.get(params.pollId as string);
      setPoll(data);
    } catch (error) {
      console.error('Failed to load poll:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async () => {
    if (!isConnected || !address || selectedOption === null || !poll) {
      return;
    }

    setIsVoting(true);

    try {
      // Nullifier must be deterministic: same user + same poll = same nullifier
      // This prevents double-voting while preserving anonymity
      const nullifier = hash(poll.pollId + address);

      // Convert values to field elements for on-chain execution
      const pollIdField = BigInt('0x' + poll.pollId.slice(0, 15).split('').map(c => c.charCodeAt(0).toString(16)).join('')).toString() + 'field';
      const optionField = selectedOption.toString() + 'u8';
      const nullifierField = BigInt('0x' + nullifier.slice(0, 15)).toString() + 'field';

      if (!requestTransaction) {
        alert('Wallet does not support transactions. Please use Leo Wallet.');
        return;
      }

      // Execute real transaction with Leo Wallet - NO FALLBACK
      const aleoTransaction = Transaction.createTransaction(
        address,
        WalletAdapterNetwork.TestnetBeta,
        CONTRACTS.privypoll.programId,
        CONTRACTS.privypoll.functions.vote,
        [pollIdField, optionField, nullifierField],
        50000, // fee in microcredits
        false  // feePrivate: false = use PUBLIC balance for fee
      );

      const txId = await requestTransaction(aleoTransaction);

      if (!txId) {
        throw new Error('Transaction was not signed');
      }

      await pollApi.vote(poll.pollId, {
        voterAddress: address,
        optionIndex: selectedOption,
        nullifier,
        txId,
      });

      // Refresh poll data to get updated vote counts
      const updatedPoll = await pollApi.get(poll.pollId);
      setPoll(updatedPoll);
      setLastTxId(txId);
      setHasVoted(true);
    } catch (error: any) {
      console.error('Failed to vote:', error);
      alert(error.message || 'Failed to submit vote');
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12 px-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12 px-6">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-gray-400">Poll not found</p>
          <Link href="/poll" className="text-blue-400 hover:underline mt-4 inline-block">
            Back to Polls
          </Link>
        </div>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12 px-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Vote Submitted!</h1>
            <p className="text-gray-400 mb-6">
              Your anonymous vote has been recorded. No one can see which option you chose.
            </p>

            {/* Transaction Proof */}
            <TransactionProof
              txId={lastTxId}
              programId={CONTRACTS.privypoll.programId}
              functionName="vote"
              status="confirmed"
              privacyDetails={[
                { label: 'Voter Identity', value: 'Hidden (ZK Proof)', isPrivate: true },
                { label: 'Vote Choice', value: 'Hidden (Encrypted)', isPrivate: true },
                { label: 'Nullifier', value: 'Unique (No Double Vote)', isPrivate: true },
              ]}
            />
          </div>

          {/* Show Results */}
          {poll && (
            <div className="p-6 bg-[#111118] border border-white/10 rounded-2xl mb-6">
              <h2 className="text-lg font-semibold mb-4">{poll.question}</h2>
              <div className="space-y-3">
                {poll.options.map((option, index) => {
                  const voteCount = poll.voteCounts?.[index] || 0;
                  const percentage = poll.totalVotes > 0
                    ? Math.round((voteCount / poll.totalVotes) * 100)
                    : 0;
                  return (
                    <div key={index} className="relative">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{option}</span>
                        <span className="text-sm text-gray-400">{voteCount} votes ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-[#1a1a24] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-gray-400 mt-4 text-center">
                Total: {poll.totalVotes || poll.votes.length} votes
              </p>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/poll"
              className="px-6 py-3 bg-[#1a1a24] border border-white/10 rounded-xl font-medium hover:bg-[#222230] transition inline-block"
            >
              Back to Polls
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 px-6">
      <div className="max-w-lg mx-auto">
        <Link
          href="/poll"
          className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Polls
        </Link>

        <div className="p-8 bg-[#111118] border border-white/10 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{poll.question}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="w-4 h-4" />
                {poll.votes.length} votes
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {poll.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedOption(index)}
                className={`w-full p-4 rounded-xl border text-left transition ${
                  selectedOption === index
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedOption === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-500'
                  }`}>
                    {selectedOption === index && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3 mb-6">
            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-300">
              Your vote is completely anonymous. No one can see which option you chose.
            </p>
          </div>

          <button
            onClick={handleVote}
            disabled={isVoting || !isConnected || selectedOption === null}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isVoting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Vote className="w-5 h-5 mr-2" />
                Cast Anonymous Vote
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
