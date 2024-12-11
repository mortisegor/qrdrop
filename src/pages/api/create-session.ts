import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

const emojis = ['🐱', '🐶', '🐼', '🦊', '🦁', '🐯', '🦒', '🦘', '🦫', '🦥'];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = uuidv4();
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  res.status(200).json({ 
    sessionId, 
    emoji: randomEmoji 
  });
} 