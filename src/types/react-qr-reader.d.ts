declare module 'react-qr-reader' {
  import { FC } from 'react';

  interface QrResult {
    getText(): string;
  }

  interface QrReaderProps {
    onResult: (result: QrResult | null) => void;
    constraints?: MediaTrackConstraints;
  }

  export const QrReader: FC<QrReaderProps>;
} 