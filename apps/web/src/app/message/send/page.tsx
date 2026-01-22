'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Shield, Loader2, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import { generateId, stringToField, encrypt, hash } from '@/lib/encryption';
import { messageApi } from '@/lib/api';
import { TransactionProof } from '@/components/TransactionProof';
import { CONTRACTS } from '@/lib/contracts';

export default function SendMessagePage() {
  const router = useRouter();
  const { publicKey, connected, requestTransaction } = useWallet();
  const address = publicKey || '';
  const isConnected = connected;
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [lastTxId, setLastTxId] = useState('');

  // Validate Aleo address format
  const isValidAleoAddress = (addr: string): boolean => {
    return /^aleo1[a-z0-9]{58}$/.test(addr);
  };

  const handleSend = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet');
      return;
    }

    if (!recipient || !message) {
      alert('Please fill in all fields');
      return;
    }

    if (!isValidAleoAddress(recipient)) {
      alert('Invalid Aleo address format. Address should start with "aleo1" and be 63 characters long.');
      return;
    }

    if (message.length > 500) {
      alert('Message is too long. Maximum 500 characters.');
      return;
    }

    if (!requestTransaction) {
      alert('Wallet does not support transactions. Please use Leo Wallet.');
      return;
    }

    setIsLoading(true);

    try {
      // Generate message ID and encrypt
      const messageId = generateId();
      const encryptedContent = encrypt(message, recipient);
      const senderHash = hash(address);

      // Convert to field elements for Aleo
      // send_message(recipient: address, message_id: field, encrypted_content: field, encrypted_content_2: field)
      const msgIdField = BigInt('0x' + messageId.slice(0, 12).split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')).toString() + 'field';
      const contentField1 = BigInt('0x' + encryptedContent.slice(0, 12).split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')).toString() + 'field';
      const contentField2 = BigInt('0x' + (encryptedContent.slice(12, 24) || '0').split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('') || '1').toString() + 'field';

      // Create the transaction for send_message
      // Function signature: send_message(recipient: address, message_id: field, encrypted_content: field, encrypted_content_2: field)
      const aleoTransaction = Transaction.createTransaction(
        address,
        WalletAdapterNetwork.TestnetBeta,
        CONTRACTS.privymsg.programId,
        CONTRACTS.privymsg.functions.sendMessage,
        [recipient, msgIdField, contentField1, contentField2],
        50000, // fee in microcredits
        false  // feePrivate: false = use PUBLIC balance for fee
      );

      // Request the transaction from Leo Wallet - MUST sign
      const txId = await requestTransaction(aleoTransaction);

      if (!txId) {
        throw new Error('Transaction was not signed');
      }

      // Record in database with encrypted content
      await messageApi.send({
        messageId,
        recipientAddress: recipient,
        senderHash,
        encryptedContent,
        txId,
      });

      setLastTxId(txId);
      setIsSent(true);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert(error.message || 'Failed to send message. Please sign the transaction in Leo Wallet.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Message Sent!</h1>
          <p className="text-gray-400 mb-6">
            Your anonymous message has been delivered. The recipient will never
            know who sent it.
          </p>

          {/* Transaction Proof */}
          <div className="mb-8">
            <TransactionProof
              txId={lastTxId}
              programId={CONTRACTS.privymsg.programId}
              functionName="send_message"
              status="confirmed"
              privacyDetails={[
                { label: 'Sender Identity', value: 'Hidden (BHP256 Hash)', isPrivate: true },
                { label: 'Message Content', value: 'Encrypted (AES-256)', isPrivate: true },
                { label: 'Recipient', value: `${recipient.slice(0, 12)}...`, isPrivate: false },
              ]}
            />
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setIsSent(false);
                setRecipient('');
                setMessage('');
              }}
              className="px-6 py-3 bg-purple-500 rounded-xl font-medium hover:bg-purple-600 transition"
            >
              Send Another
            </button>
            <Link
              href="/message"
              className="px-6 py-3 bg-[#1a1a24] border border-white/10 rounded-xl font-medium hover:bg-[#222230] transition"
            >
              Back to Messages
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
          href="/message"
          className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Messages
        </Link>

        <div className="p-8 bg-[#111118] border border-white/10 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Send Anonymous Message</h1>
              <p className="text-sm text-gray-400">Your identity stays hidden</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                placeholder="aleo1..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value.toLowerCase())}
                className={`w-full px-4 py-3 bg-[#0a0a0f] border rounded-xl font-mono text-sm focus:outline-none transition ${
                  recipient && !isValidAleoAddress(recipient)
                    ? 'border-red-500/50 focus:border-red-500'
                    : recipient && isValidAleoAddress(recipient)
                    ? 'border-green-500/50 focus:border-green-500'
                    : 'border-white/10 focus:border-purple-500'
                }`}
              />
              {recipient && !isValidAleoAddress(recipient) && (
                <p className="text-xs text-red-400 mt-1">
                  Invalid address format (must be aleo1... with 63 characters)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Message
              </label>
              <textarea
                placeholder="Write your anonymous message..."
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                maxLength={500}
                rows={5}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl resize-none focus:border-purple-500 focus:outline-none transition"
              />
              <p className={`text-xs mt-1 ${message.length >= 450 ? 'text-yellow-500' : 'text-gray-500'}`}>
                {message.length}/500 characters
              </p>
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-start gap-3">
              <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-purple-300">
                Your message will be encrypted and sent anonymously. The recipient
                will not be able to see your identity.
              </p>
            </div>

            <button
              onClick={handleSend}
              disabled={isLoading || !isConnected}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Anonymously
                </>
              )}
            </button>

            {!isConnected && (
              <p className="text-sm text-center text-yellow-500">
                Please connect your wallet to send messages
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
