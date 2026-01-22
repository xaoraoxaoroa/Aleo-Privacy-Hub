'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Inbox, Mail, MailOpen, ArrowLeft, Loader2, Shield, X, Copy, Check } from 'lucide-react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { messageApi } from '@/lib/api';
import { decrypt } from '@/lib/encryption';

interface Message {
  id: string;
  messageId: string;
  senderHash: string;
  encryptedContent: string;
  createdAt: string;
}

export default function InboxPage() {
  const { publicKey, connected } = useWallet();
  const address = publicKey || '';
  const isConnected = connected;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleViewMessage = (msg: Message) => {
    setSelectedMessage(msg);
    // Decrypt using the recipient's address (which was used as the encryption key)
    if (msg.encryptedContent && address) {
      const decrypted = decrypt(msg.encryptedContent, address);
      setDecryptedContent(decrypted || 'Unable to decrypt message');
    } else {
      setDecryptedContent('No encrypted content available');
    }
  };

  const closeMessageModal = () => {
    setSelectedMessage(null);
    setDecryptedContent(null);
  };

  useEffect(() => {
    if (isConnected && address) {
      loadMessages();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, address]);

  const loadMessages = async () => {
    try {
      const data = await messageApi.getInbox(address!);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/message"
          className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Messages
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
            <Inbox className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Your Inbox</h1>
            <p className="text-sm text-gray-400">
              {messages.length} anonymous messages
            </p>
          </div>
        </div>

        {!isConnected ? (
          <div className="p-12 bg-[#111118] border border-white/10 rounded-2xl text-center">
            <Mail className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Connect your wallet to view messages</p>
          </div>
        ) : isLoading ? (
          <div className="p-12 bg-[#111118] border border-white/10 rounded-2xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 bg-[#111118] border border-white/10 rounded-2xl text-center">
            <Mail className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No messages yet</p>
            <p className="text-sm text-gray-500">
              Share your address to receive anonymous messages
            </p>
            <div className="mt-4 p-3 bg-[#0a0a0f] rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Your address:</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm text-purple-400 break-all flex-1">{address}</p>
                <button
                  onClick={handleCopyAddress}
                  className="p-2 hover:bg-white/10 rounded-lg transition flex-shrink-0"
                  title="Copy address"
                >
                  {copiedAddress ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => handleViewMessage(msg)}
                className="w-full p-4 bg-[#111118] border border-white/10 rounded-xl hover:border-purple-500/50 transition text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-purple-500 mt-1" />
                    <div>
                      <p className="font-medium">
                        From: Anonymous #{msg.senderHash.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Click to decrypt and read
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-purple-300">
            Messages are encrypted end-to-end. Only you can decrypt and read them
            using your private key.
          </p>
        </div>
      </div>

      {/* Message View Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111118] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MailOpen className="w-6 h-6 text-purple-400" />
                <div>
                  <h2 className="text-lg font-bold">Anonymous Message</h2>
                  <p className="text-xs text-gray-400">
                    From: #{selectedMessage.senderHash.slice(0, 12)}...
                  </p>
                </div>
              </div>
              <button
                onClick={closeMessageModal}
                className="p-2 hover:bg-white/5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#0a0a0f] rounded-xl min-h-[150px] mb-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">
                {decryptedContent || 'Decrypting...'}
              </pre>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Received: {new Date(selectedMessage.createdAt).toLocaleString()}
              </span>
              <span className="font-mono">
                ID: {selectedMessage.messageId.slice(0, 8)}...
              </span>
            </div>

            <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-xs text-purple-300">
                <Shield className="w-3 h-3 inline mr-1" />
                This message was decrypted locally using your private key.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
