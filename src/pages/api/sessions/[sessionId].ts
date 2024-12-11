import { NextApiRequest, NextApiResponse } from 'next';
import sessionStore from '@/lib/sessionStore';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[Session API] ====== Start ======');
  const { sessionId } = req.query;

  console.log('[Session API] Request:', { 
    sessionId,
    method: req.method,
    existingSessions: sessionStore.entries().map(([id, session]) => ({
      id,
      mode: session.mode,
      hasContent: !!session.content,
      contentLength: session.content?.length,
      expiresAt: session.expiresAt
    }))
  });

  if (!sessionId || typeof sessionId !== 'string') {
    console.log('[Session API] Invalid session ID format');
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  // Ищем сессию в хранилище
  const session = sessionStore.get(sessionId);
  
  if (!session) {
    console.log('[Session API] Session not found');
    return res.status(404).json({ error: 'Session not found' });
  }

  // Проверяем срок действия сессии
  if (new Date() > session.expiresAt) {
    console.log('[Session API] Session expired', {
      expiresAt: session.expiresAt,
      now: new Date()
    });
    sessionStore.delete(sessionId);
    return res.status(404).json({ error: 'Session expired' });
  }

  // Если это receive сессия, ищем соответствующую transfer сессию
  if (session.mode === 'receive') {
    const transferSession = sessionStore.entries().find(([, s]) => 
      s.mode === 'transfer' && s.emoji === session.emoji
    );

    if (transferSession) {
      console.log('[Session API] Found transfer session:', {
        id: transferSession[0],
        hasContent: !!transferSession[1].content,
        contentLength: transferSession[1].content?.length
      });
      return res.status(200).json(transferSession[1]);
    }
  }

  // Возвращаем информацию о сессии
  console.log('[Session API] Success', {
    id: session.id,
    mode: session.mode,
    hasContent: !!session.content,
    contentLength: session.content?.length
  });
  console.log('[Session API] ====== End ======');

  return res.status(200).json(session);
} 