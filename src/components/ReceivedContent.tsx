import { useState, useEffect } from 'react';
import styles from '@/styles/ReceivedContent.module.css';

interface ReceivedContentProps {
  content: string;
}

export default function ReceivedContent({ content }: ReceivedContentProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 5000); // Увеличили время анимации до 5 секунд

    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.contentBox} ${isAnimating ? styles.animating : ''}`}>
        <div className={styles.waveEffect} />
        <pre className={styles.content}>{content}</pre>
        <button 
          className={styles.copyButton}
          onClick={handleCopy}
        >
          {isCopied ? 'Скопировано' : 'Копировать'}
        </button>
      </div>
    </div>
  );
} 