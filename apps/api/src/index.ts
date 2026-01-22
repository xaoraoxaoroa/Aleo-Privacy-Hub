import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// User routes
app.post('/api/user', async (req, res) => {
  try {
    const { address } = req.body;
    const user = await prisma.user.upsert({
      where: { address },
      update: {},
      create: { address },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Message routes
app.post('/api/message/send', async (req, res) => {
  try {
    const { messageId, recipientAddress, senderHash, encryptedContent, txId } = req.body;

    let recipient = await prisma.user.findUnique({ where: { address: recipientAddress } });
    if (!recipient) {
      recipient = await prisma.user.create({ data: { address: recipientAddress } });
    }

    const message = await prisma.message.create({
      data: {
        messageId,
        recipientId: recipient.id,
        senderHash,
        encryptedContent: encryptedContent || '',
        txId,
      },
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record message' });
  }
});

app.get('/api/message/inbox/:address', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { address: req.params.address },
      include: { messages: true },
    });
    // Return messages with encrypted content for client-side decryption
    res.json(user?.messages || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Poll routes
app.post('/api/poll/create', async (req, res) => {
  try {
    const { pollId, question, options, creatorAddress, endBlock, txId } = req.body;

    let creator = await prisma.user.findUnique({ where: { address: creatorAddress } });
    if (!creator) {
      creator = await prisma.user.create({ data: { address: creatorAddress } });
    }

    const poll = await prisma.poll.create({
      data: {
        pollId,
        question,
        options: JSON.stringify(options),
        creatorId: creator.id,
        endBlock,
        txId,
      },
    });
    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

app.get('/api/poll/:pollId', async (req, res) => {
  try {
    const poll = await prisma.poll.findUnique({
      where: { pollId: req.params.pollId },
      include: { votes: true },
    });
    if (poll) {
      const options = JSON.parse(poll.options);
      // Calculate vote counts per option
      const voteCounts = options.map((_: string, index: number) =>
        poll.votes.filter(v => v.optionIndex === index).length
      );
      res.json({
        ...poll,
        options,
        voteCounts,
        totalVotes: poll.votes.length
      });
    } else {
      res.status(404).json({ error: 'Poll not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get poll' });
  }
});

app.get('/api/polls', async (req, res) => {
  try {
    const polls = await prisma.poll.findMany({
      include: { votes: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(polls.map(p => ({ ...p, options: JSON.parse(p.options) })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get polls' });
  }
});

app.post('/api/poll/:pollId/vote', async (req, res) => {
  try {
    const { voterAddress, optionIndex, nullifier, txId } = req.body;

    if (optionIndex === undefined || optionIndex < 0) {
      return res.status(400).json({ error: 'Invalid option index' });
    }

    const poll = await prisma.poll.findUnique({ where: { pollId: req.params.pollId } });
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    // Check if already voted (by nullifier)
    const existingVote = await prisma.vote.findUnique({ where: { nullifier } });
    if (existingVote) {
      return res.status(400).json({ error: 'Already voted on this poll' });
    }

    let voter = await prisma.user.findUnique({ where: { address: voterAddress } });
    if (!voter) {
      voter = await prisma.user.create({ data: { address: voterAddress } });
    }

    const vote = await prisma.vote.create({
      data: {
        pollDbId: poll.id,
        voterId: voter.id,
        optionIndex,
        nullifier,
        txId,
      },
    });
    res.json(vote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// Notes routes
app.post('/api/notes/create', async (req, res) => {
  try {
    const { noteId, ownerAddress, txId } = req.body;

    let owner = await prisma.user.findUnique({ where: { address: ownerAddress } });
    if (!owner) {
      owner = await prisma.user.create({ data: { address: ownerAddress } });
    }

    const note = await prisma.note.create({
      data: {
        noteId,
        ownerId: owner.id,
        txId,
      },
    });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.get('/api/notes/:address', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { address: req.params.address },
      include: { notes: { orderBy: { createdAt: 'desc' } } },
    });
    res.json(user?.notes || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get notes' });
  }
});

app.get('/api/notes/get/:noteId', async (req, res) => {
  try {
    const note = await prisma.note.findUnique({
      where: { noteId: req.params.noteId },
    });
    if (note) {
      res.json(note);
    } else {
      res.status(404).json({ error: 'Note not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get note' });
  }
});

app.put('/api/notes/:noteId', async (req, res) => {
  try {
    const { isPinned, txId } = req.body;
    const note = await prisma.note.update({
      where: { noteId: req.params.noteId },
      data: {
        ...(isPinned !== undefined && { isPinned }),
        ...(txId && { txId }),
      },
    });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.delete('/api/notes/:noteId', async (req, res) => {
  try {
    await prisma.note.delete({
      where: { noteId: req.params.noteId },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
