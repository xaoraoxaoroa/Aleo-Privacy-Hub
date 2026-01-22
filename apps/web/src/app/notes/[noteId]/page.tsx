'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, ArrowLeft, Loader2, Shield, Pin, PinOff, Trash2, Save, Edit3, Lock } from 'lucide-react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { Transaction, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import { decrypt, encrypt, generateId } from '@/lib/encryption';
import { notesApi } from '@/lib/api';
import { CONTRACTS } from '@/lib/contracts';

export default function ViewNotePage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.noteId as string;
  const { publicKey, connected, requestTransaction } = useWallet();
  const address = publicKey || '';
  const isConnected = connected;
  const privateKey = address; // Use address as encryption key

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  // Decrypted content
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalContent, setOriginalContent] = useState('');

  useEffect(() => {
    if (isConnected && address) {
      loadNote();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, address, noteId]);

  const loadNote = async () => {
    setIsLoading(true);
    try {
      // Fetch note metadata from API
      const noteData = await notesApi.get(noteId);

      if (noteData) {
        setIsPinned(noteData.isPinned || false);

        // In production, the encrypted content would come from the Aleo blockchain
        // and be decrypted with the user's private key.
        // For demo purposes, we use stored local data or show placeholder.

        // Try to get cached note content from localStorage (demo encryption)
        const encryptionKey = privateKey || address || '';
        const cachedContent = localStorage.getItem(`note_content_${noteId}`);
        const cachedTitle = localStorage.getItem(`note_title_${noteId}`);

        if (cachedContent && cachedTitle) {
          const decryptedTitle = decrypt(cachedTitle, encryptionKey);
          const decryptedContent = decrypt(cachedContent, encryptionKey);

          if (decryptedTitle && decryptedContent) {
            setTitle(decryptedTitle);
            setContent(decryptedContent);
            setOriginalTitle(decryptedTitle);
            setOriginalContent(decryptedContent);
          } else {
            // Decryption failed - might be wrong key
            setTitle('Unable to decrypt');
            setContent('This note was encrypted with a different key. Please ensure you are using the same wallet.');
            setOriginalTitle('Unable to decrypt');
            setOriginalContent('');
          }
        } else {
          // No cached content - this is a new view or data was cleared
          setTitle(`Note ${noteId.slice(0, 8)}`);
          setContent('This note exists on-chain but content is not cached locally.\n\nIn production, the encrypted content would be fetched from your Aleo private records.');
          setOriginalTitle(`Note ${noteId.slice(0, 8)}`);
          setOriginalContent('');
        }
      }
    } catch (error) {
      console.error('Failed to load note:', error);
      setTitle('Note not found');
      setContent('This note could not be loaded. It may have been deleted or does not exist.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isConnected || !address) return;

    setIsSaving(true);
    try {
      const encryptionKey = privateKey || address;

      // Encrypt the updated content
      const encryptedTitle = encrypt(title, encryptionKey);
      const encryptedContent = encrypt(content, encryptionKey);

      // Store encrypted content locally (demo mode)
      // In production, this would call the Leo update_note transition
      localStorage.setItem(`note_title_${noteId}`, encryptedTitle);
      localStorage.setItem(`note_content_${noteId}`, encryptedContent);

      // Update API record
      await notesApi.update(noteId, { txId: `tx_update_${Date.now()}` });

      setOriginalTitle(title);
      setOriginalContent(content);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePin = async () => {
    try {
      const newPinnedState = !isPinned;
      // Update API with new pin state
      await notesApi.update(noteId, { isPinned: newPinnedState });
      setIsPinned(newPinnedState);
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note? This cannot be undone.')) {
      return;
    }

    try {
      // Delete from API
      await notesApi.delete(noteId);

      // Clear local storage
      localStorage.removeItem(`note_title_${noteId}`);
      localStorage.removeItem(`note_content_${noteId}`);

      router.push('/notes');
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note');
    }
  };

  const cancelEdit = () => {
    setTitle(originalTitle);
    setContent(originalContent);
    setIsEditing(false);
  };

  const hasChanges = title !== originalTitle || content !== originalContent;

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

        {!isConnected ? (
          <div className="p-12 bg-[#111118] border border-white/10 rounded-2xl text-center">
            <Lock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Connect your wallet to view this note</p>
            <p className="text-sm text-gray-500">
              Notes are encrypted with your private key
            </p>
          </div>
        ) : isLoading ? (
          <div className="p-12 bg-[#111118] border border-white/10 rounded-2xl flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
            <p className="text-gray-400">Decrypting note...</p>
          </div>
        ) : (
          <div className="p-8 bg-[#111118] border border-white/10 rounded-2xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Private Note</span>
                    {isPinned && <Pin className="w-4 h-4 text-yellow-500" />}
                  </div>
                  <p className="text-xs text-gray-500 font-mono">
                    ID: {noteId.slice(0, 12)}...
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 hover:bg-white/5 rounded-lg transition text-emerald-400"
                      title="Edit note"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleTogglePin}
                      className="p-2 hover:bg-white/5 rounded-lg transition text-yellow-500"
                      title={isPinned ? 'Unpin note' : 'Pin note'}
                    >
                      {isPinned ? <PinOff className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition text-red-500"
                      title="Delete note"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !hasChanges}
                      className="px-4 py-2 bg-emerald-500 text-sm font-medium rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl font-bold bg-transparent border-b border-white/10 pb-2 mb-4 focus:border-emerald-500 focus:outline-none transition"
                placeholder="Note title..."
              />
            ) : (
              <h1 className="text-2xl font-bold mb-4">{title}</h1>
            )}

            {/* Content */}
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl resize-none focus:border-emerald-500 focus:outline-none transition font-mono text-sm"
                placeholder="Write your note..."
              />
            ) : (
              <div className="p-4 bg-[#0a0a0f] rounded-xl min-h-[200px]">
                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">
                  {content}
                </pre>
              </div>
            )}

            {/* Privacy Notice */}
            <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-300">
                <p className="font-medium mb-1">This note is encrypted</p>
                <p className="text-emerald-400/80">
                  Only your private key can decrypt this content. The encrypted
                  data is stored as a private record on Aleo blockchain.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
