import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import QRCode from 'qrcode.react';
import styles from '@/styles/FileUpload.module.css';
import ReceivedContent from './ReceivedContent';
import { SessionMode } from '@/types/session';
import Image from 'next/image';

type FileUploadMode = Exclude<SessionMode, 'transfer'>;

const FileUpload = ({ mode, sessionId }: { mode: FileUploadMode, sessionId: string }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [receivedContent, setReceivedContent] = useState<string | null>(null);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout>();

  console.log('FileUpload render:', { mode, sessionId, hasContent: !!receivedContent });

  // Функция для проверки наличия контента
  const checkContent = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/content`);
      const data = await response.json();
      
      if (response.ok && data.content) {
        console.log('Content received:', data.content);
        setReceivedContent(data.content);
        // Очищаем интервал после получения контента
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      }
    } catch (error) {
      console.error('Error checking content:', error);
    }
  };

  // Запускаем проверку контента для режима получения
  useEffect(() => {
    if (mode === 'receive' && !receivedContent) {
      // Сразу проверяем контент
      checkContent();
      
      // Запускаем периодическую проверку
      pollIntervalRef.current = setInterval(checkContent, 1000);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [mode, sessionId, receivedContent]);

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;

    try {
      setIsLoading(true);
      console.log('Saving text for session:', sessionId);
      
      const response = await fetch(`/api/sessions/${sessionId}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: text.trim()
        }),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok && data.transferSessionId) {
        console.log('Text saved, starting scanner');
        // Сразу переходим к сканированию
        router.push(`/scan/${sessionId}`);
      } else {
        console.error('Error response:', data);
        alert(data.error || 'Произошла ошибка при сохранении текста. Попробуйте еще раз.');
      }
    } catch (error) {
      console.error('Error saving text:', error);
      alert('Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const getBaseUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '192.168.1.102') {
      return 'https://192.168.1.102:3000';
    }
    return `${window.location.protocol}//${window.location.host}`;
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

  // Если это режим получения и есть контент, показываем его
  if (mode === 'receive' && receivedContent) {
    return (
      <div className={styles.container}>
        <div className={styles.wave} />
        <button 
          className={styles.backButton}
          onClick={() => router.push('/')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className={styles.contentBox}>
          <pre className={styles.content}>{receivedContent}</pre>
          <button 
            className={styles.copyButton}
            onClick={() => {
              navigator.clipboard.writeText(receivedContent);
              // Показываем мини-уведомление об успешном копировании
              const button = document.querySelector(`.${styles.copyButton}`);
              if (button) {
                button.classList.add(styles.copied);
                setTimeout(() => {
                  button.classList.remove(styles.copied);
                }, 1000);
              }
            }}
            title="Копировать текст"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 4V16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V7.242C20 6.97556 19.9467 6.71181 19.8433 6.46624C19.7399 6.22068 19.5885 5.99824 19.398 5.812L16.083 2.57C15.7094 2.20466 15.2076 2.00007 14.685 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V9C4 8.46957 4.21071 7.96086 4.58579 7.58579C4.96086 7.21071 5.46957 7 6 7H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Если это режим получения, показываем QR код
  if (mode === 'receive') {
    return (
      <div className={styles.container}>
        <button 
          className={styles.backButton}
          onClick={() => router.push('/')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className={styles.qrContainer}>
          <QRCode 
            value={`${getBaseUrl()}/scan/${sessionId}`}
            size={256}
            level="H"
            className={styles.qrCode}
          />
          <p className={styles.hint}>
            Отсканируйте QR-код на устройстве отправителя
          </p>
        </div>
      </div>
    );
  }

  // Режим отправки - показываем форму ввода текста
  return (
    <div className={styles.container}>
      <button 
        className={styles.backButton}
        onClick={() => router.push('/')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className={styles.textContainer}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите текст для отправки..."
          rows={1}
        />
        <button 
          className={styles.actionButton}
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
        >
          {isLoading ? 'Сохранение...' : 'Отправить'}
        </button>
      </div>
    </div>
  );
}

export default FileUpload;