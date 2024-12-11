import { useState, useEffect } from 'react';
import styles from '@/styles/ReceiveText.module.css';
import ReceivedContent from './ReceivedContent';
import EmojiDisplay from './EmojiDisplay';

interface ReceiveTextProps {
  sessionId: string;
  emoji: string;
}

export default function ReceiveText({ sessionId, emoji }: ReceiveTextProps) {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}/content`);
        const data = await response.json();
        if (data.content) {
          setContent(data.content);
        }
      } catch (error) {
        console.error('Failed to fetch content:', error);
      }
    };

    fetchContent();
  }, [sessionId]);

  return (
    <div className={styles.container}>
      {emoji && <EmojiDisplay emoji={emoji} />}
      {content && <ReceivedContent content={content} />}
    </div>
  );
} 