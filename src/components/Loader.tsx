import React, { useState } from 'react';
import { EscBook } from './EscBook';

interface LoaderProps {
  onFinish?: () => void;
}

export const Loader: React.FC<LoaderProps> = ({ onFinish }) => {
  const [done, setDone] = useState(false);
  const [out, setOut] = useState(false);

  const handleBookFinished = () => {
    setDone(true);
    setTimeout(() => {
      setOut(true);
      if (onFinish) onFinish();
    }, 700);
  };

  if (out) return null;

  return (
    <div id="loader" className={`${done ? 'done' : ''} ${out ? 'out' : ''}`}>
      <div className="loader-book-stage">
        <EscBook
          isLoaderMode={true}
          onLoaderFinished={handleBookFinished}
          width={320}
          height={440}
        />
      </div>

      <div className="loader-info-box">
        <div className="loader-title">
          {done ? '✦ Archive Opened at ESC Logo ✦' : 'Flipping through ESC Archive…'}
        </div>
        <div className="loader-bar">
          <div className={`loader-progress ${done ? 'complete' : ''}`}></div>
        </div>
        <div className="loader-subhint">
          {done ? 'Entering Study Desk…' : 'Seeking Official Club Insignia'}
        </div>
      </div>
    </div>
  );
};

export default Loader;
