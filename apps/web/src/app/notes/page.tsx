'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Plus, Pin, Shield, ArrowRight, Loader2, Lock } from 'lucide-react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { notesApi } from '@/lib/api';

interface Note {
  id: string;
  noteId: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const { publicKey, connected } = useWallet();
  const address = publicKey || '';
  const isConnected = connected;
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      loadNotes();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, address]);

  const loadNotes = async () => {
    try {
      const data = await notesApi.getAll(address!);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">PrivyNotes</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Store encrypted notes that only you can read.
            Client-side encryption means your data stays private.
          </p>
        </div>

        {/* Create Button */}
        {isConnected && (
          <div className="mb-8">
            <Link
              href="/notes/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium hover:opacity-90 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Note
            </Link>
          </div>
        )}

        {/* Notes List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Notes</h2>

          {!isConnected ? (
            <div className="p-12 bg-[#111118] border border-white/10 rounded-2xl text-center">
              <Lock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">Connect your wallet to view notes</p>
              <p className="text-sm text-gray-500">
                Your notes are encrypted with your private key
              </p>
            </div>
          ) : isLoading ? (
            <div className="p-12 bg-[#111118] border border-white/10 rounded-2xl flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : notes.length === 0 ? (
            <div className="p-12 bg-[#111118] border border-white/10 rounded-2xl text-center">
              <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No notes yet</p>
              <p className="text-sm text-gray-500">Create your first private note!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {/* Pinned notes first */}
              {notes
                .sort((a, b) => {
                  if (a.isPinned && !b.isPinned) return -1;
                  if (!a.isPinned && b.isPinned) return 1;
                  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                })
                .map((note) => (
                  <Link
                    key={note.id}
                    href={`/notes/${note.noteId}`}
                    className="group p-6 bg-[#111118] border border-white/10 rounded-2xl hover:border-emerald-500/50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium group-hover:text-emerald-400 transition">
                              Note #{note.noteId.slice(0, 8)}
                            </h3>
                            {note.isPinned && (
                              <Pin className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            Click to decrypt and view
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-emerald-400 text-sm font-medium mt-4">
                      Open Note
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
            <Shield className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-semibold">How Private Notes Work</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 text-emerald-400 font-bold">
                1
              </div>
              <h4 className="font-medium mb-1">Write Locally</h4>
              <p className="text-sm text-gray-400">
                Your note content stays in your browser until encrypted.
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 text-emerald-400 font-bold">
                2
              </div>
              <h4 className="font-medium mb-1">Encrypt with Key</h4>
              <p className="text-sm text-gray-400">
                Your private key encrypts the note before it leaves your device.
              </p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 text-emerald-400 font-bold">
                3
              </div>
              <h4 className="font-medium mb-1">Store On-Chain</h4>
              <p className="text-sm text-gray-400">
                The encrypted note is stored as a private record only you own.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
