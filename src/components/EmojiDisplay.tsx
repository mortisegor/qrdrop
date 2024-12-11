import styles from '@/styles/EmojiDisplay.module.css';

interface EmojiDisplayProps {
  emoji: string;
}

export default function EmojiDisplay({ emoji }: EmojiDisplayProps) {
  return (
    <div className={styles.container}>
      <div className={styles.emoji}>{emoji}</div>
    </div>
  );
} 