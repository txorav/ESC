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
    // Smooth dissolve into the identical hero desk book
    setTimeout(() => {
      setOut(true);
      if (onFinish) onFinish();
    }, 450);
  };

  if (out) return null;

  return (
    <div id="loader" className={`${done ? 'done' : ''} ${out ? 'out' : ''}`}>
      <div className="loader-book-stage">
        <EscBook
          isLoaderMode={true}
          onLoaderFinished={handleBookFinished}
          startPage={0}
          width={350}
          height={480}
        />
      </div>

      <div className="loader-title-clean">
        {done ? '✦ ESC ARCHIVE OPENED ✦' : 'OPENING ESC ARCHIVE…'}
      </div>
    </div>
  );
};

export default Loader;
