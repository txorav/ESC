import React, { useState } from 'react';

export const IntroClouds: React.FC = () => {
  const fullText = "ESC is the best English club ever. Since 2017 we have met to speak, debate, record and grow together.";
  const [chars, setChars] = useState<{ char: string; orig: string; scrambled: boolean }[]>(() =>
    [...fullText].map((c) => ({ char: c, orig: c, scrambled: false }))
  );

  const glyphs = '!<>-_\\/[]{}=+*^?#_~0123456789ABCDEF';

  const handlePointerMove = (index: number) => {
    if (chars[index].scrambled || !chars[index].orig.trim()) return;

    setChars((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], scrambled: true };
      return copy;
    });

    let count = 0;
    const interval = setInterval(() => {
      setChars((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          char: glyphs[Math.floor(Math.random() * glyphs.length)]
        };
        return copy;
      });

      if (++count > 7) {
        clearInterval(interval);
        setChars((prev) => {
          const copy = [...prev];
          copy[index] = {
            ...copy[index],
            char: copy[index].orig,
            scrambled: false
          };
          return copy;
        });
      }
    }, 45);
  };

  return (
    <section className="sec" id="intro" data-bg="#111744">
      <div className="cloud" style={{ top: '10%', left: '-5%', width: '500px', height: '160px' }}></div>
      <div className="cloud" style={{ top: '42%', left: '30%', width: '700px', height: '220px', animationDuration: '60s' }}></div>
      <div className="cloud" style={{ bottom: '8%', left: '-15%', width: '600px', height: '180px' }}></div>

      <div className="scrambled-wrap">
        <h2 id="scramble-title">
          {chars.map((item, idx) => (
            <span
              key={idx}
              className={item.scrambled ? 'active' : ''}
              onPointerEnter={() => handlePointerMove(idx)}
            >
              {item.char}
            </span>
          ))}
        </h2>
        <p className="intro-sub">
          Step into our community of passionate communicators, competitive debaters, and visionary storytellers. From our vintage beginnings to modern triumphs, discover what makes ESC extraordinary.
        </p>
      </div>

      <div id="text-loop-container">
        <div id="text-loop-track">
          <span>ESC introduction</span>
          <span>Where Leaders Speak</span>
          <span>Since 2017</span>
          <span>ECHO Podcast &amp; Debates</span>
          <span>ESC introduction</span>
        </div>
      </div>
    </section>
  );
};
