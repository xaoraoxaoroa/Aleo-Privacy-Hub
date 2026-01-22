'use client';

import React from 'react';
import { Shield, ExternalLink, Check, Clock, Hash, Lock } from 'lucide-react';
import Link from 'next/link';

interface TransactionProofProps {
  txId: string;
  programId: string;
  functionName: string;
  status: 'pending' | 'confirmed' | 'failed';
  privacyDetails?: {
    label: string;
    value: string;
    isPrivate: boolean;
  }[];
}

export function TransactionProof({
  txId,
  programId,
  functionName,
  status,
  privacyDetails = [],
}: TransactionProofProps) {
  const explorerUrl = `https://testnet.aleo.info/transaction/${txId}`;
  const programUrl = `https://testnet.aleo.info/program/${programId}`;

  return (
    <div className="p-4 bg-[#0a0a0f] border border-emerald-500/20 rounded-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            status === 'confirmed' ? 'bg-emerald-500/20' :
            status === 'pending' ? 'bg-yellow-500/20' : 'bg-red-500/20'
          }`}>
            {status === 'confirmed' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : status === 'pending' ? (
              <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />
            ) : (
              <Shield className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {status === 'confirmed' ? 'ZK Proof Verified' :
               status === 'pending' ? 'Proof Generating...' : 'Proof Failed'}
            </p>
            <p className="text-xs text-gray-500">
              {functionName} on {programId}
            </p>
          </div>
        </div>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
        >
          View on Explorer
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Transaction ID */}
      <div className="p-3 bg-[#111118] rounded-lg">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          <Hash className="w-3 h-3" />
          Transaction ID
        </div>
        <p className="font-mono text-xs text-gray-300 break-all">{txId}</p>
      </div>

      {/* Privacy Details */}
      {privacyDetails.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Privacy Breakdown
          </p>
          <div className="grid gap-2">
            {privacyDetails.map((detail, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-[#111118] rounded-lg"
              >
                <span className="text-xs text-gray-400">{detail.label}</span>
                <div className="flex items-center gap-2">
                  {detail.isPrivate ? (
                    <>
                      <span className="text-xs font-mono text-emerald-400">
                        {detail.value}
                      </span>
                      <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center">
                        <Lock className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                    </>
                  ) : (
                    <span className="text-xs font-mono text-gray-300">
                      {detail.value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ZK Proof Explanation */}
      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
        <p className="text-xs text-emerald-300">
          <Shield className="w-3 h-3 inline mr-1" />
          This transaction was verified using a <strong>zero-knowledge proof</strong>.
          The blockchain confirms validity without revealing your private data.
        </p>
      </div>

      {/* Program Link */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-xs text-gray-500">Smart Contract</span>
        <a
          href={programUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-mono"
        >
          {programId}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
