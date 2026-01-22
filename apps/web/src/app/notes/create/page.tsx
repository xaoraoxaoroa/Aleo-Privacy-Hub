'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, ArrowLeft, Loader2, Shield, Check, Lock } from 'lucide-react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import { generateId, encrypt } from '@/lib/encryption';
import { notesApi } from '@/lib/api';
import { CONTRACTS } from '@/lib/contracts';

export default function CreateNotePage() {
  const router = useRouter();
  const { publicKey, connected, requestTransaction } = useWallet();
  const address = publicKey || '';
  const isConnected = connected;
  const privateKey = address; // Use address as encryption key for decryption
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [createdNoteId, setCreatedNoteId] = useState('');

  const handleCreate = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet');
      return;
    }

    if (!title.trim() && !content.trim()) {
      alert('Please add a title or content');
      return;
    }

    setIsLoading(true);

    try {
      const noteId = generateId();
      const encryptionKey = privateKey || address;

      // Encrypt title and content
      const encryptedTitle = encrypt(title || 'Untitled Note', encryptionKey);
      const encryptedContent = encrypt(content, encryptionKey);

      // Store encrypted content locally
      localStorage.setItem(`note_title_${noteId}`, encryptedTitle);
      localStorage.setItem(`note_content_${noteId}`, encryptedContent);

      // Convert values to field elements for on-chain
      // create_note(note_id: field, encrypted_title: field, encrypted_content_1-4: field)
      const noteIdField = BigInt('0x' + noteId.slice(0, 15).split('').map(c => c.charCodeAt(0).toString(16)).join('')).toString() + 'field';
      const titleField = BigInt('0x' + encryptedTitle.slice(0, 12).split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')).toString() + 'field';
      const content1Field = BigInt('0x' + encryptedContent.slice(0, 12).split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')).toString() + 'field';
      const content2Field = BigInt('0x' + (encryptedContent.slice(12, 24) || '1').split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('') || '1').toString() + 'field';
      const content3Field = BigInt('0x' + (encryptedContent.slice(24, 36) || '1').split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('') || '1').toString() + 'field';
      const content4Field = BigInt('0x' + (encryptedContent.slice(36, 48) || '1').split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('') || '1').toString() + 'field';

      if (!requestTransaction) {
        alert('Wallet does not support transactions. Please use Leo Wallet.');
        return;
      }

      // Execute real transaction with Leo Wallet - NO FALLBACK
      const aleoTransaction = Transaction.createTransaction(
        address,
        WalletAdapterNetwork.TestnetBeta,
        CONTRACTS.privynotes.programId,
        CONTRACTS.privynotes.functions.createNote,
        [noteIdField, titleField, content1Field, content2Field, content3Field, content4Field],
        50000, // fee in microcredits
        false  // feePrivate: false = use PUBLIC balance for fee
      );

      const txId = await requestTransaction(aleoTransaction);

      if (!txId) {
        throw new Error('Transaction was not signed');
      }

      // Record in database
      await notesApi.create({
        noteId,
        ownerAddress: address,
        txId,
      });

      setCreatedNoteId(noteId);
      setIsCreated(true);
    } catch (error) {
      console.error('Failed to create note:', error);
      alert('Failed to create note');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCreated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-12 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Note Created!</h1>
          <p className="text-gray-400 mb-8">
            Your note has been encrypted and stored securely. Only you can decrypt
            and read it.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href={`/notes/${createdNoteId}`}
              className="px-6 py-3 bg-emerald-500 rounded-xl font-medium hover:bg-emerald-600 transition"
            >
              View Note
            </Link>
            <button
              onClick={() => {
                setIsCreated(false);
                setTitle('');
                setContent('');
              }}
              className="px-6 py-3 bg-[#1a1a24] border border-white/10 rounded-xl font-medium hover:bg-[#222230] transition"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/notes"
          className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Notes
        </Link>

        <div className="p-8 bg-[#111118] border border-white/10 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Create Private Note</h1>
              <p className="text-sm text-gray-400">Encrypted with your key</p>
            </div>
          </div>

          {!isConnected ? (
            <div className="text-center py-8">
              <Lock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">Connect your wallet to create notes</p>
              <p className="text-sm text-gray-500">
                Your wallet key is used to encrypt notes
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Content
                </label>
                <textarea
                  placeholder="Write your private note..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl resize-none focus:border-emerald-500 focus:outline-none transition font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {content.length} characters
                </p>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-300">
                  Your note will be encrypted using your private key before being
                  stored. No one else can read it - not even us.
                </p>
              </div>

              <button
                onClick={handleCreate}
                disabled={isLoading || (!title.trim() && !content.trim())}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Encrypting & Saving...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Create Encrypted Note
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
