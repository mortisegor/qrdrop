import { useState } from 'react';
import QRCode from 'qrcode.react';
import styles from '@/styles/ShareButton.module.css';

const ShareButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}`
    : '';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QrDrop',
          text: 'Быстрый обмен текстом через QR код',
          url: shareUrl
        });
      } catch (err) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <button 
        className={styles.shareButton} 
        onClick={handleShare}
        aria-label="Поделиться"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L8.08261 9.19813C7.54305 8.46815 6.6981 8 5.75 8C4.09315 8 2.75 9.34315 2.75 11C2.75 12.6569 4.09315 14 5.75 14C6.6981 14 7.54305 13.5319 8.08261 12.8019L15.0227 16.6294C15.0077 16.7508 15 16.8745 15 17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17C21 15.3431 19.6569 14 18 14C17.0519 14 16.207 14.4681 15.6674 15.1981L8.72735 11.3706C8.74234 11.2492 8.75 11.1255 8.75 11C8.75 10.8745 8.74234 10.7508 8.72735 10.6294L15.6674 6.80187C16.207 7.53185 17.0519 8 18 8Z" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isModalOpen && (
        <div className={styles.modal} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <h3>Поделиться QrDrop</h3>
            <div className={styles.qrContainer}>
              <QRCode 
                value={shareUrl}
                size={200}
                level="H"
              />
            </div>
            <p className={styles.hint}>Отсканируйте QR-код для перехода на сайт</p>
            <button 
              className={styles.copyButton}
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                alert('Ссылка скопирована!');
              }}
            >
              Копировать ссылку
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton; 