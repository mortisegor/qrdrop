import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { sessionId } = req.query;

  if (req.method === 'POST') {
    // Сохраняем контент
    const { content } = req.body;
    // TODO: Добавить сохранение в базу данных
    res.status(200).json({ success: true });
  } else if (req.method === 'GET') {
    // Получаем контент
    // TODO: Добавить получение из базы данных
    res.status(200).json({ content: 'Test content' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 
