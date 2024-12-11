import { NextApiRequest, NextApiResponse } from 'next';
import sessionStore from '@/lib/sessionStore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { sessionId } = req.body;
  const session = sessionStore.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Обновляем время истечения QR кода
  const now = new Date();
  session.qrExpiry = new Date(now.getTime() + 60 * 1000); // 1 минута
  sessionStore.set(sessionId, session);

  // Генерируем новый QR URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`;
  const qrUrl = `${baseUrl}/scan/${sessionId}`;

  return res.status(200).json({ qrUrl });
} 