import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/SendText.module.css';

interface SendTextProps {
  sessionId: string;
}

export default function SendText({ sessionId }: SendTextProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    if (!text.trim()) return;
    
    setIsSending(true);
    try {
      // Сначала сохраняем текст в текущей сессии
      const response = await fetch(`/api/sessions/${sessionId}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to save text');
      }

      // Переходим на страницу сканирования
      router.push(`/scan/${sessionId}`);
    } catch (err) {
      console.error('Error sending text:', err);
      setIsSending(false);
    }
  };

  return (
    <div className={styles.container}>
      <textarea
        className={styles.textArea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Введите текст для отправки..."
        disabled={isSending}
      />
      <button
        className={styles.sendButton}
        onClick={handleSend}
        disabled={!text.trim() || isSending}
      >
        {isSending ? 'Отправка...' : 'Отправить'}
      </button>
    </div>
  );
} 