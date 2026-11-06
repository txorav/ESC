import React, { useEffect, useState } from 'react';

interface LoaderProps {
  onFinish?: () => void;
}

export const Loader: React.FC<LoaderProps> = ({ onFinish }) => {
  const [done, setDone] = useState(false);
  const [out, setOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDone(true);
      const outTimer = setTimeout(() => {
        setOut(true);
        if (onFinish) onFinish();
      }, 800);
      return () => clearTimeout(outTimer);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (out) return null;

  return (
    <div id="loader" className={out ? 'out' : ''}>
      <div className="loader-wrap">
        <div className={`lb ${done ? 'done' : ''}`} id="lb">
          <div className="base"></div>
          <div className="pg" style={{ '--i': 0 } as React.CSSProperties}></div>
          <div className="pg" style={{ '--i': 1 } as React.CSSProperties}></div>
          <div className="pg" style={{ '--i': 2 } as React.CSSProperties}></div>
          <div className="pg" style={{ '--i': 3 } as React.CSSProperties}></div>
          <div className="pg" style={{ '--i': 4 } as React.CSSProperties}></div>
          <div className="pg" style={{ '--i': 5 } as React.CSSProperties}></div>
          <div className="pg top">
            <div className="book-logo-box">
              <img src="/logo.svg" alt="ESC Logo" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
            </div>
          </div>
        </div>
      </div>
      <div className="loader-title">Opening ESC Archive…</div>
      <div className="loader-bar">
        <div className="loader-progress"></div>
      </div>
    </div>
  );
};
