import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import jsQR from 'jsqr';
import styles from '@/styles/Scan.module.css';

export default function ScanPage() {
  const router = useRouter();
  const { sessionId } = router.query;
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getBaseUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '192.168.1.102') {
      return 'https://192.168.1.102:3000';
    }
    return `${window.location.protocol}//${window.location.host}`;
  };

  useEffect(() => {
    if (!sessionId) return;

    const startScanning = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      try {
        // Сначала пробуем получить заднюю камеру
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
        } catch {
          // Если не получилось, пробуем любую камеру
          stream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
        }

        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Ждем загрузки метаданных видео
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().then(() => resolve());
            };
          }
        });

        // Настраиваем canvas
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) throw new Error('Failed to get canvas context');

        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        setDebug('Scanning started...');

        // Функция сканирования кадра
        const scanFrame = () => {
          if (!videoRef.current || !context || !canvas) return;

          try {
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
              setDebug(`QR Code found: ${code.data}`);
              const baseUrl = getBaseUrl();
              
              if (code.data.includes('/scan/')) {
                const scannedSessionId = code.data.split('/scan/')[1].split('?')[0];
                setDebug(`Session ID extracted: ${scannedSessionId}`);
                handleSuccessfulScan(scannedSessionId);
                return;
              }
            }

            requestAnimationFrame(scanFrame);
          } catch (err) {
            console.error('Frame scan error:', err);
            setDebug(`Scan error: ${err}`);
            requestAnimationFrame(scanFrame);
          }
        };

        scanFrame();
      } catch (err) {
        console.error('Camera error:', err);
        if ((err as Error).name === 'NotAllowedError') {
          setError(
            'Для сканирования QR-кода необходим доступ к камере.\n' +
            'Пожалуйста:\n' +
            '1. В настройках браузера разрешите доступ к камере\n' +
            '2. Перезагрузите страницу'
          );
        } else {
          setError(
            'Не удалось запустить сканер.\n' +
            'Попробуйте:\n' +
            '1. Использовать Safari на iOS\n' +
            '2. Использовать Chrome на Android\n' +
            '3. Перезагрузить страницу'
          );
        }
      }
    };

    startScanning();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [sessionId]);

  const handleSuccessfulScan = async (scannedSessionId: string) => {
    setDebug(`Scanned session ID: ${scannedSessionId}`);
    
    try {
      // Сначала получаем контент из нашей transfer сессии
      const getContentResponse = await fetch(`/api/sessions/${sessionId}/content`);
      const contentData = await getContentResponse.json();
      
      if (!getContentResponse.ok || !contentData.content) {
        throw new Error('Failed to get content from transfer session');
      }

      // Отправляем полученный контент в сессию получателя
      const sendResponse = await fetch(`/api/sessions/${scannedSessionId}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: contentData.content // Отправляем сам контент, а не ID сессии
        }),
      });

      if (!sendResponse.ok) {
        throw new Error('Failed to send content');
      }

      // Отправляем событие об успешном сканировании
      window.dispatchEvent(new Event('qr-scanned'));

      // Останавливаем камеру
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Показываем сообщение об успехе
      setIsSuccess(true);
      
      // Через 2 секунды возвращаемся на главную
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      console.error('Error sending content:', err);
      setError('Произошла ошибка при отправке текста');
    }
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p style={{ whiteSpace: 'pre-line' }}>{error}</p>
        </div>
        <button 
          className={styles.button}
          onClick={() => router.push('/')}
        >
          Вернуться на главную
        </button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.success}>
          Текст успешно отправлен!
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.scannerContainer}>
        <video 
          ref={videoRef} 
          className={styles.video}
          playsInline
          autoPlay
          muted
        />
        <canvas 
          ref={canvasRef}
          style={{ display: 'none' }}
        />
        <div className={styles.scannerOverlay} />
        <p className={styles.scannerHint}>
          Наведите камеру на QR-код
        </p>
        <div className={styles.debug}>
          {debug}
        </div>
        <button 
          className={styles.closeButton}
          onClick={() => {
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
            }
            router.push('/');
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
} 