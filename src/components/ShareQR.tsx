import { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { useTheme } from '@/hooks/useTheme';
import styles from '@/styles/ShareQR.module.css';

export default function ShareQR() {
  const { theme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(true);
  const [isCopied, setCopied] = useState(false);
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Поделиться QrDrop</h2>
          <button className={styles.closeButton}>✕</button>
        </div>
        
        <div className={styles.qrContainer}>
          <div className={`${styles.qrContent} ${isAnimating ? styles.animating : ''}`}>
            <div className={styles.waveEffect} />
            <QRCode 
              value={siteUrl}
              size={theme === 'dark' ? 200 : 256}
              level="H"
              includeMargin={true}
              bgColor={theme === 'dark' ? '#1a1a1a' : '#ffffff'}
              fgColor={theme === 'dark' ? '#ffffff' : '#000000'}
              className={styles.qrCode}
            />
          </div>
        </div>

        <p className={styles.hint}>
          Отсканируйте QR-код для перехода на сайт
        </p>

        <button 
          className={styles.copyButton}
          onClick={handleCopy}
        >
          {isCopied ? 'Скопировано' : 'Копировать ссылку'}
        </button>
      </div>
    </div>
  );
} 