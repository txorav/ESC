import React from 'react';
import ScrambledText from './reactbits/ScrambledText';
import TextLoop from './reactbits/TextLoop';

export const IntroClouds: React.FC = () => {
  return (
    <section className="sec" id="intro" data-bg="#111744">
      <div className="cloud" style={{ top: '10%', left: '-5%', width: '500px', height: '160px' }}></div>
      <div className="cloud" style={{ top: '42%', left: '30%', width: '700px', height: '220px', animationDuration: '60s' }}></div>
      <div className="cloud" style={{ bottom: '8%', left: '-15%', width: '600px', height: '180px' }}></div>

      <div className="scrambled-wrap">
        <h2 id="scramble-title">
          <ScrambledText
            radius={80}
            duration={1.2}
            speed={0.4}
            scrambleColor="#4E55D3"
            color="#FFFFFF"
            className="esc-scramble"
          >
            ESC is the best English club ever. Since 2017 we have met to speak, debate, record and grow together.
          </ScrambledText>
        </h2>
        <p className="intro-sub">
          Step into our community of passionate communicators, competitive debaters, and visionary storytellers. From our vintage beginnings to modern triumphs, discover what makes ESC extraordinary.
        </p>
      </div>

      <div id="text-loop-corner-wrap" style={{ position: 'absolute', right: '4vw', bottom: '4vh', width: '380px', height: '120px', zIndex: 10 }}>
        <TextLoop
          text="ESC introduction · Where Leaders Speak · Since 2017 · "
          shape="wave"
          curviness={20}
          speed={1.5}
          color="#FFFFFF"
          fontSize={16}
          fontWeight={700}
        />
      </div>
    </section>
  );
};

