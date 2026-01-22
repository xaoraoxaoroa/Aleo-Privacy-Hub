'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Plus, Trash2, ArrowLeft, Loader2, Shield, Check } from 'lucide-react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import { generateId, stringToField } from '@/lib/encryption';
import { pollApi } from '@/lib/api';
import { CONTRACTS } from '@/lib/contracts';

export default function CreatePollPage() {
  const router = useRouter();
  const { publicKey, connected, requestTransaction } = useWallet();
  const address = publicKey || '';
  const isConnected = connected;
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(8640);
  const [isLoading, setIsLoading] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet');
      return;
    }

    const validOptions = options.filter(o => o.trim());
    if (!question || validOptions.length < 2) {
      alert('Please fill in question and at least 2 options');
      return;
    }

    setIsLoading(true);

    try {
      const pollId = generateId();

      // Convert poll ID to field for on-chain
      // create_poll(poll_id: field, encrypted_question: field, option_count: u8, duration_blocks: u32)
      const pollIdField = BigInt('0x' + pollId.slice(0, 15).split('').map(c => c.charCodeAt(0).toString(16)).join('')).toString() + 'field';
      const encryptedQuestionField = BigInt('0x' + question.slice(0, 12).split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')).toString() + 'field';
      const numOptionsField = validOptions.length.toString() + 'u8';
      const endBlockField = (1000000 + duration).toString() + 'u32';

      if (!requestTransaction) {
        alert('Wallet does not support transactions. Please use Leo Wallet.');
        return;
      }

      // Execute real transaction with Leo Wallet - NO FALLBACK
      const aleoTransaction = Transaction.createTransaction(
        address,
        WalletAdapterNetwork.TestnetBeta,
        CONTRACTS.privypoll.programId,
        CONTRACTS.privypoll.functions.createPoll,
        [pollIdField, encryptedQuestionField, numOptionsField, endBlockField],
        50000, // fee in microcredits
        false  // feePrivate: false = use PUBLIC balance for fee
      );

      const txId = await requestTransaction(aleoTransaction);

      if (!txId) {
        throw new Error('Transaction was not signed');
      }

      await pollApi.create({
        pollId,
        question,
        options: validOptions,
        creatorAddress: address,
        endBlock: 1000000 + duration,
        txId,
      });

      router.push(`/poll/${pollId}`);
    } catch (error) {
      console.error('Failed to create poll:', error);
      alert('Failed to create poll');
    } finally {
      setIsLoading(false);
    }
  };

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
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Create Anonymous Poll</h1>
              <p className="text-sm text-gray-400">Votes are completely private</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Question</label>
              <input
                type="text"
                placeholder="What would you like to ask?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Options</label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none transition"
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(index)}
                        className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 10 && (
                <button
                  onClick={addOption}
                  className="mt-2 px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/10 rounded-lg transition flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none transition"
              >
                <option value={360}>1 hour</option>
                <option value={1440}>4 hours</option>
                <option value={8640}>1 day</option>
                <option value={60480}>1 week</option>
              </select>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-300">
                Individual votes are completely anonymous. Only aggregate results
                are visible after voting ends.
              </p>
            </div>

            <button
              onClick={handleCreate}
              disabled={isLoading || !isConnected}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Create Poll
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
