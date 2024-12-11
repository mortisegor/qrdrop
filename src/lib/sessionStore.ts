import fs from 'fs';
import path from 'path';
import { Session, SessionMode } from '@/types/session';
import { v4 as uuidv4 } from 'uuid';
import { getRandomEmoji } from '@/utils/emoji';

const SESSIONS_FILE = path.join(process.cwd(), 'sessions.json');

class SessionStore {
  private sessions: Map<string, Session>;
  private usedEmojis: Set<string>;

  constructor() {
    this.sessions = new Map();
    this.usedEmojis = new Set();
    this.loadSessions();
  }

  private loadSessions(): void {
    try {
      if (fs.existsSync(SESSIONS_FILE)) {
        const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
        const sessions = JSON.parse(data);
        this.sessions = new Map(Object.entries(sessions));

        // Преобразуем строковые даты обратно в объекты Date
        for (const [, session] of this.sessions) {
          session.createdAt = new Date(session.createdAt);
          session.expiresAt = new Date(session.expiresAt);
        }
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }

  private saveSessions(): void {
    try {
      const sessions = Object.fromEntries(this.sessions);
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }

  public get(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  public set(sessionId: string, session: Session): void {
    // Получаем существующую сессию, если она есть
    const existingSession = this.sessions.get(sessionId);
    
    // Если это обновление существующей сессии, сохраняем её контент
    if (existingSession && session.mode === existingSession.mode) {
      session.content = session.content || existingSession.content;
    }

    // Удаляем только старые transfer сессии
    if (session.mode === 'transfer') {
      const now = new Date();
      for (const [id, existingSession] of this.sessions.entries()) {
        if (existingSession.mode === 'transfer' && 
            (now.getTime() - existingSession.createdAt.getTime() > 5 * 60 * 1000 ||
             existingSession.emoji === session.emoji)) {
          console.log('[SessionStore] Removing old transfer session:', {
            id,
            emoji: existingSession.emoji
          });
          this.sessions.delete(id);
        }
      }
    }

    // Сохраняем новую сессию
    this.sessions.set(sessionId, session);
    console.log('[SessionStore] Set new session:', {
      id: sessionId,
      mode: session.mode,
      emoji: session.emoji,
      hasContent: !!session.content,
      contentLength: session.content?.length
    });
    this.saveSessions();
  }

  public delete(sessionId: string): void {
    console.log('[SessionStore] Deleting session:', sessionId);
    this.sessions.delete(sessionId);
    this.saveSessions();
  }

  public entries(): [string, Session][] {
    return Array.from(this.sessions.entries());
  }

  public cleanup(): void {
    console.log('[SessionStore] Running cleanup...');
    const now = new Date();
    for (const [id, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        console.log('[SessionStore] Removing expired session:', id);
        this.sessions.delete(id);
      }
    }
    this.cleanupEmojis();
    this.saveSessions();
  }

  public findActiveSession(mode: SessionMode): Session | undefined {
    const now = new Date();
    for (const session of this.sessions.values()) {
      if (session.mode === mode && now < session.expiresAt) {
        return session;
      }
    }
    return undefined;
  }

  public generateId(): string {
    return uuidv4();
  }

  private getUniqueEmoji(): string {
    let emoji = getRandomEmoji();
    const maxAttempts = 10;
    let attempts = 0;

    // Пытаемся получить уникальное эмодзи, которое не используется
    while (this.usedEmojis.has(emoji) && attempts < maxAttempts) {
      emoji = getRandomEmoji();
      attempts++;
    }

    this.usedEmojis.add(emoji);
    return emoji;
  }

  private cleanupEmojis(): void {
    const activeEmojis = new Set(
      Array.from(this.sessions.values())
        .filter(s => new Date() < s.expiresAt)
        .map(s => s.emoji)
    );
    this.usedEmojis = activeEmojis;
  }

  public createSession(mode: SessionMode): Session {
    this.cleanup(); // Очищаем старые сессии и эмодзи

    const now = new Date();
    const session: Session = {
      id: uuidv4(),
      mode,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
      emoji: this.getUniqueEmoji(),
      qrExpiry: new Date(now.getTime() + 60 * 1000)
    };

    this.sessions.set(session.id, session);
    return session;
  }
}

const sessionStore = new SessionStore();

export default sessionStore; 