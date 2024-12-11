import { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import ReceivedContent from './ReceivedContent';
import ProgressBar from './ProgressBar';
import styles from '@/styles/ReceiveText.module.css';
import EmojiDisplay from './EmojiDisplay';
import { useTheme } from '@/hooks/useTheme';

interface ReceiveTextProps {
  sessionId: string;
  emoji: string;
}

export default function ReceiveText({ sessionId, emoji }: ReceiveTextProps) {
  const [qrUrl, setQrUrl] = useState('');
  const [content, setContent] = useState<string | null>(null);
  const { theme } = useTheme();
  const qrSize = theme === 'dark' ? 200 : 256;

  // Инициализация и обновление QR кода
  useEffect(() => {
    const updateQr = async () => {
      try {
        const response = await fetch('/api/sessions/refresh-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        const data = await response.json();
        setQrUrl(data.qrUrl);
      } catch (err) {
        console.error('Error updating QR:', err);
      }
    };

    updateQr();
    const timer = setInterval(updateQr, 60000); // Обновляем QR каждую минуту
    return () => clearInterval(timer);
  }, [sessionId]);

  // Проверка контента
  useEffect(() => {
    const checkContent = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}/content`);
        const data = await response.json();
        
        if (response.ok && data.content) {
          setContent(data.content);
        }
      } catch (err) {
        console.error('Error checking content:', err);
      }
    };

    const timer = setInterval(checkContent, 1000);
    return () => clearInterval(timer);
  }, [sessionId]);

  const handleQRExpired = () => {
    // Обновл��ем QR код по истечении времени
    window.location.reload();
  };

  const handleContentExpired = () => {
    // Очищаем контент и возвращаемся на главную
    setContent(null);
    window.location.href = '/';
  };

  return (
    <div className={styles.container}>
      {!content ? (
        <div className={styles.qrContainer}>
          <EmojiDisplay emoji={emoji} />
          <QRCode 
            value={qrUrl}
            size={qrSize}
            level="H"
            includeMargin={true}
            bgColor={theme === 'dark' ? '#111111' : '#ffffff'}
            fgColor={theme === 'dark' ? '#ffffff' : '#000000'}
          />
          <div className={styles.timerContainer}>
            <ProgressBar 
              duration={60} 
              onComplete={handleQRExpired}
            />
            <div className={styles.timerText}>
              QR код обновится автоматически
            </div>
          </div>
          <p className={styles.hint}>
            Покажите этот QR-код отправителю
          </p>
        </div>
      ) : (
        <div className={styles.contentWrapper}>
          <ReceivedContent content={content} />
          <div className={styles.timerContainer}>
            <ProgressBar 
              duration={180} 
              onComplete={handleContentExpired}
            />
            <div className={styles.timerText}>
              Текст будет доступен ещё 3 минуты
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 