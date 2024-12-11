export type SessionMode = 'send' | 'receive' | 'transfer';

export interface Session {
  id: string;
  mode: SessionMode;
  createdAt: Date;
  expiresAt: Date;
  emoji?: string;
  content?: string;
  qrExpiry?: Date;
  contentExpiry?: Date;
}

export interface CreateSessionResponse {
  sessionId: string;
  mode: SessionMode;
  emoji: string;
} 