import { useState } from 'react';
import ShareQR from '@/components/ShareQR';
import ReceiveText from '@/components/ReceiveText';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [emoji, setEmoji] = useState<string>('');

  const handleCreateSession = async () => {
    try {
      const response = await fetch('/api/create-session');
      const data = await response.json();
      setSessionId(data.sessionId);
      setEmoji(data.emoji);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <main className={styles.main}>
      {!sessionId ? (
        <button onClick={handleCreateSession} className={styles.createButton}>
          Создать QR
        </button>
      ) : (
        <ReceiveText sessionId={sessionId} emoji={emoji} />
      )}
    </main>
  );
}