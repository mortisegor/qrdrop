import { NextApiRequest, NextApiResponse } from 'next';
import sessionStore from '@/lib/sessionStore';
import { Session } from '@/types/session';

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

  // Проверяем срок действия QR кода для receive сессий
  if (session.mode === 'receive' && session.qrExpiry) {
    const now = new Date();
    if (now > session.qrExpiry) {
      return res.status(400).json({ error: 'QR code expired' });
    }
  }

  // GET запрос - получение контента
  if (req.method === 'GET') {
    // Для receive сессии ищем соответствующую transfer сессию
    if (session.mode === 'receive') {
      const transferSession = sessionStore.entries()
        .find(([, s]) => 
          s.mode === 'transfer' && 
          s.emoji === session.emoji && 
          s.content &&
          new Date() < s.expiresAt
        );

      if (transferSession) {
        const content = transferSession[1].content;
        // Устанавливаем время истечения контента
        session.contentExpiry = new Date(Date.now() + 3 * 60 * 1000); // 3 минуты
        sessionStore.set(sessionId, session);
        return res.status(200).json({ content });
      }
    }

    // Проверяем время истечения контента
    if (session.contentExpiry && new Date() > session.contentExpiry) {
      return res.status(404).json({ error: 'Content expired' });
    }

    return res.status(200).json({ content: session.content });
  }

  // POST запрос - сохранение контента
  if (req.method === 'POST') {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    session.content = content;
    session.contentExpiry = new Date(Date.now() + 3 * 60 * 1000); // 3 минуты
    sessionStore.set(sessionId, session);

    // Создаем transfer сессию для передачи контента
    if (session.mode === 'send') {
      const transferSession: Session = {
        id: sessionStore.generateId(),
        mode: 'transfer',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 минут
        emoji: session.emoji,
        content: content,
        contentExpiry: new Date(Date.now() + 3 * 60 * 1000) // 3 минуты
      };
      sessionStore.set(transferSession.id, transferSession);
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
} 
