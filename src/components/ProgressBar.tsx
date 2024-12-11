import { useEffect, useState } from 'react';
import styles from '@/styles/ProgressBar.module.css';

interface ProgressBarProps {
  duration: number; // Общая длительность в секундах
  onComplete?: () => void;
}

export default function ProgressBar({ duration, onComplete }: ProgressBarProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const progress = (timeLeft / duration) * 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, onComplete]);

  return (
    <div className={styles.progressContainer}>
      <div 
        className={styles.progressBar}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
} 