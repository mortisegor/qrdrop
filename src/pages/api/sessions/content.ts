import { NextApiRequest, NextApiResponse } from 'next';
import sessionStore from '@/lib/sessionStore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { sessionId } = req.query;
  
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  const session = sessionStore.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (new Date() > session.expiresAt) {
    sessionStore.delete(sessionId);
    return res.status(404).json({ error: 'Session expired' });
  }

  if (req.method === 'POST') {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    session.content = content;
    sessionStore.set(sessionId, session);
    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ content: session.content });
  }

  return res.status(405).end();
} 