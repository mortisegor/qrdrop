import { NextApiRequest, NextApiResponse } from 'next';
import sessionStore from '@/lib/sessionStore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { mode } = req.body as { mode: 'send' | 'receive' };

    // Создаем новую сессию с уникальным эмодзи
    const session = sessionStore.createSession(mode);
    
    // Возвращаем базовый URL для QR кода
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`;
    const qrUrl = `${baseUrl}/scan/${session.id}`;
    
    return res.status(200).json({
      sessionId: session.id,
      mode: session.mode,
      emoji: session.emoji,
      qrUrl
    });
  }

  return res.status(405).end();
}