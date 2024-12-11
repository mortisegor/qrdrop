import { useState, useEffect } from 'react';
import styles from '@/styles/EmojiDisplay.module.css';

interface EmojiDisplayProps {
  emoji: string;
}

export default function EmojiDisplay({ emoji }: EmojiDisplayProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    setHasAnimated(false);
    
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setHasAnimated(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [emoji]);

  return (
    <div className={`${styles.emojiContainer} ${isAnimating ? styles.animating : ''}`}>
      <div className={styles.waveEffect} />
      <div className={styles.emoji} style={{ opacity: hasAnimated ? 1 : 0 }}>
        {emoji}
      </div>
    </div>
  );
} 