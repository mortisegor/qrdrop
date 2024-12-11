import { useState } from 'react';
import { SessionMode } from '@/types/session';
import SendText from '@/components/SendText';
import ReceiveText from '@/components/ReceiveText';
import ThemeToggle from '@/components/ThemeToggle';
import ShareButton from '@/components/ShareButton';
import styles from '@/styles/Home.module.css';
import Image from 'next/image';

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.5 4.5L12 13.5M21.5 4.5L15.5 20.5L12 13.5L4.5 10.5L21.5 4.5Z" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ReceiveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12C21 12 16.9706 16 12 16C7.02944 16 3 12 3 12M12 16V20M9 19L12 20L15 19" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Home() {
  const [mode, setMode] = useState<SessionMode | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [emoji, setEmoji] = useState<string>('');

  const handleModeSelect = async (selectedMode: SessionMode) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode: selectedMode }),
      });
      
      const data = await response.json();
      setMode(data.mode);
      setSessionId(data.sessionId);
      setEmoji(data.emoji);
    } catch (err) {
      console.error('Error creating session:', err);
    }
  };

  const renderContent = () => {
    if (!mode || !sessionId) return null;

    switch (mode) {
      case 'send':
        return <SendText sessionId={sessionId} />;
      case 'receive':
        return <ReceiveText sessionId={sessionId} emoji={emoji} />;
      default:
        return null;
    }
  };

  if (!mode) {
    return (
      <div className={styles.container}>
        <ThemeToggle />
        <ShareButton />
        <div className={styles.appLogo}>
          <div className={styles.appLogoInner}>
            <Image 
              src="/images/logo.png"
              alt="QRDrop Logo"
              width={98}
              height={98}
              className={styles.appLogoImage}
              fetchPriority="high"
            />
          </div>
        </div>
        <h1 className={styles.title}>QrDrop</h1>
        <div className={styles.modeSelection}>
          <button 
            className={`${styles.modeButton} ${styles.sendButton}`}
            onClick={() => handleModeSelect('send')}
          >
            <SendIcon />
            Отправить
          </button>
          <button 
            className={`${styles.modeButton} ${styles.receiveButton}`}
            onClick={() => handleModeSelect('receive')}
          >
            <ReceiveIcon />
            Получить
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ThemeToggle />
      <ShareButton />
      {renderContent()}
    </>
  );
}