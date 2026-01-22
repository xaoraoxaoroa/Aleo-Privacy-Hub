# Aleo Privacy Hub

> **Prove everything. Reveal nothing.**

A privacy-first application suite built on Aleo blockchain, featuring anonymous messaging, private voting, and encrypted notes — all powered by zero-knowledge proofs.

![Aleo](https://img.shields.io/badge/Aleo-Testnet-purple)
![Leo](https://img.shields.io/badge/Leo-Smart%20Contracts-blue)
![Status](https://img.shields.io/badge/Status-Live%20on%20Testnet-green)

---

## What is Aleo Privacy Hub?

Three privacy-preserving applications that demonstrate the power of Aleo's zero-knowledge architecture:

| App | Description | Privacy Feature |
|-----|-------------|-----------------|
| **PrivyMessage** | Anonymous messaging | Sender identity hidden via BHP256 hash |
| **PrivyPoll** | Private voting | Nullifier-based double-vote prevention |
| **PrivyNotes** | Encrypted notes | Client-side encryption + on-chain proof |

**Every transaction is REAL** — deployed on Aleo testnet with actual Leo smart contracts.

---

## Deployed Contracts

All contracts are live on **Aleo Testnet**:

| Program | Transaction ID |
|---------|---------------|
| `privymsg_v1.aleo` | `at1vcyrvgqmtgjxx6atv3f9zfts0ypc85uunnc35s5cumhmqcgvv5rq96xsj2` |
| `privypoll_v1.aleo` | `at1hkdj7fhtgdkwwt3pss4kx0azug05p2hx7hj234p8pa0qnwrw8y9sfhwmp9` |
| `privynotes_v1.aleo` | `at13pt0a0n8urr0vlvz3a27m6ljmjrnhry7uysqclkd46yn6xt7cqgs32us58` |

Verify on [Aleo Explorer](https://testnet.aleo.info)

---

## Privacy Architecture

### PrivyMessage — Anonymous Messaging
```
Sender → BHP256::hash_to_field(address) → sender_hash (irreversible)
Message → Encrypted as field elements → stored in private record
Result → Recipient receives message, cannot identify sender
```

### PrivyPoll — Private Voting
```
Voter → hash(poll_id + voter_address + secret) → nullifier
Vote → Private record (only voter can see their choice)
Result → Only aggregate counts are public, individual votes hidden
```

### PrivyNotes — Encrypted Notes
```
Note → Client-side AES encryption → field elements
On-chain → Only note_id and owner commitment stored
Result → Even the application cannot read your notes
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Smart Contracts** | Leo (Aleo's ZK language) |
| **Frontend** | Next.js 14, React, TailwindCSS |
| **Wallet** | Leo Wallet Adapter |
| **Backend** | Express.js, Prisma ORM |
| **Database** | SQLite (production: PostgreSQL/Supabase) |

---

## Project Structure

```
aleo-privacy-hub/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   └── src/
│   │       ├── app/         # Pages (message, poll, notes)
│   │       ├── components/  # UI components
│   │       └── lib/         # Utils, API, contracts config
│   └── api/                 # Express backend
│       ├── src/
│       └── prisma/          # Database schema
├── contracts/
│   ├── privymsg_v1/         # Anonymous messaging contract
│   ├── privypoll_v1/        # Private voting contract
│   └── privynotes_v1/       # Encrypted notes contract
└── packages/
    ├── config/              # Shared config
    └── types/               # Shared TypeScript types
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Leo Wallet browser extension
- Aleo testnet credits (get from [faucet](https://faucet.aleo.org))

### Installation

```bash
# Clone the repo
git clone https://github.com/xaoraoxaoroa/Aleo-Privacy-Hub.git
cd aleo-privacy-hub

# Install dependencies
npm install

# Setup environment
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Setup database
cd apps/api && npx prisma migrate dev

# Run the app
npm run dev
```

### Usage

1. Open http://localhost:3000
2. Connect Leo Wallet (set to Aleo Testnet)
3. Ensure you have testnet credits
4. Start using the privacy apps!

---

## Smart Contract Details

### privymsg_v1.aleo

```leo
// Records
record Message { owner, message_id, sender_hash, encrypted_content... }
record SentProof { owner, message_id, recipient_hash... }

// Functions
transition send_message(recipient, message_id, encrypted_content, encrypted_content_2)
transition mark_read(message)
transition delete_message(message)
```

### privypoll_v1.aleo

```leo
// Records
record Poll { owner, poll_id, encrypted_question, option_count... }
record VoteReceipt { owner, poll_id, nullifier... }

// Functions
transition create_poll(poll_id, encrypted_question, option_count, duration_blocks)
transition vote(poll_id, option_id, secret)
transition end_poll(poll)
```

### privynotes_v1.aleo

```leo
// Records
record Note { owner, note_id, encrypted_title, encrypted_content_1-4... }

// Functions
transition create_note(note_id, encrypted_title, encrypted_content_1-4)
transition update_note(old_note, new_encrypted_title, new_encrypted_content_1-4)
transition delete_note(note)
```

---

## Why This Matters

| Problem | Traditional Solution | Aleo Privacy Hub |
|---------|---------------------|------------------|
| Message surveillance | "Trust us" policies | Mathematically impossible to trace sender |
| Vote manipulation | Centralized databases | Cryptographic nullifiers prevent double-voting |
| Data breaches | Server-side encryption | Client-side encryption, only you have the key |

**Privacy isn't a feature. It's a right.**

---

## Judging Criteria Alignment

| Criteria | Implementation |
|----------|---------------|
| **Privacy Usage (40%)** | BHP256 hashing, nullifiers, private records, encrypted fields |
| **Technical Implementation (20%)** | 3 deployed Leo contracts, real wallet signing, no mocks |
| **User Experience (20%)** | Clean UI, wallet integration, instant feedback |
| **Practicality (10%)** | Real use cases: whistleblowers, voting, personal privacy |
| **Novelty (10%)** | Complete privacy suite, not just single demo |

---

## Verification

You can verify all deployments:

```bash
# Check contract exists
curl "https://api.explorer.provable.com/v1/testnet/transaction/at1vcyrvgqmtgjxx6atv3f9zfts0ypc85uunnc35s5cumhmqcgvv5rq96xsj2"
```

Or visit [Aleo Explorer](https://testnet.aleo.info) and search for transaction IDs.

---

## License

MIT

---

**Built for Aleo Privacy Buildathon 2026**

*Prove everything. Reveal nothing.*
